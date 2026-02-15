import argparse
import json
import sys
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path


DEFAULT_STATE_FILE = Path("seen_news.json")


def load_keywords(keywords_arg: str, keywords_file: Path | None) -> list[str]:
    keywords: list[str] = []
    if keywords_arg:
        keywords.extend([k.strip() for k in keywords_arg.split(",") if k.strip()])

    if keywords_file and keywords_file.exists():
        file_items = [line.strip() for line in keywords_file.read_text(encoding="utf-8").splitlines()]
        keywords.extend([k for k in file_items if k and not k.startswith("#")])

    unique_keywords: list[str] = []
    seen = set()
    for keyword in keywords:
        low = keyword.lower()
        if low not in seen:
            seen.add(low)
            unique_keywords.append(keyword)
    return unique_keywords


def build_rss_url(keyword: str, lang: str, country: str) -> str:
    query = urllib.parse.quote_plus(keyword)
    return f"https://news.google.com/rss/search?q={query}&hl={lang}&gl={country}&ceid={country}:{lang}"


def fetch_news(keyword: str, lang: str, country: str, timeout: int = 15) -> list[dict]:
    url = build_rss_url(keyword, lang, country)
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=timeout) as response:
        xml_data = response.read()

    root = ET.fromstring(xml_data)
    items = []
    for item in root.findall("./channel/item"):
        title = item.findtext("title", "").strip()
        link = item.findtext("link", "").strip()
        pub_date = item.findtext("pubDate", "").strip()
        guid = item.findtext("guid", "").strip() or link
        if not guid:
            continue
        items.append(
            {
                "id": guid,
                "keyword": keyword,
                "title": title,
                "link": link,
                "pub_date": pub_date,
            }
        )
    return items


def load_state(path: Path) -> set[str]:
    if not path.exists():
        return set()
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return set()
    if not isinstance(data, dict):
        return set()
    ids = data.get("seen_ids", [])
    if not isinstance(ids, list):
        return set()
    return {str(x) for x in ids}


def save_state(path: Path, seen_ids: set[str]) -> None:
    payload = {"seen_ids": sorted(seen_ids)}
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def notify(title: str, message: str) -> None:
    # Optional desktop notifications via plyer.
    try:
        from plyer import notification  # type: ignore

        notification.notify(
            title=title[:64],
            message=message[:256],
            app_name="NewsWatcher",
            timeout=8,
        )
    except Exception:
        print(f"[BILDIRIM] {title} | {message}")
        try:
            print("\a", end="")
        except Exception:
            pass


def poll_once(
    keywords: list[str],
    lang: str,
    country: str,
    seen_ids: set[str],
    first_run: bool,
    notify_on_startup: bool,
) -> tuple[int, int]:
    total_checked = 0
    total_new = 0

    for keyword in keywords:
        try:
            items = fetch_news(keyword, lang, country)
        except Exception as exc:
            print(f"[HATA] '{keyword}' için RSS çekilemedi: {exc}")
            continue

        total_checked += len(items)
        for item in items:
            if item["id"] in seen_ids:
                continue
            seen_ids.add(item["id"])
            total_new += 1

            if first_run and not notify_on_startup:
                continue

            print(f"[YENI] [{item['keyword']}] {item['title']}")
            print(f"       {item['link']}")
            notify(
                title=f"Yeni haber: {item['keyword']}",
                message=item["title"] or item["link"],
            )
    return total_checked, total_new


def run_loop(
    keywords: list[str],
    interval_seconds: int,
    lang: str,
    country: str,
    state_file: Path,
    notify_on_startup: bool,
) -> None:
    seen_ids = load_state(state_file)
    first_run = True

    print(f"Izlenecek keyword sayisi: {len(keywords)}")
    print(f"Durum dosyasi: {state_file.resolve()}")
    print(f"Taramalar arasi sure: {interval_seconds} saniye")

    try:
        while True:
            now = time.strftime("%Y-%m-%d %H:%M:%S")
            print(f"\n[{now}] Kontrol basladi...")
            checked, found_new = poll_once(
                keywords=keywords,
                lang=lang,
                country=country,
                seen_ids=seen_ids,
                first_run=first_run,
                notify_on_startup=notify_on_startup,
            )
            save_state(state_file, seen_ids)
            print(f"Kontrol tamamlandi. Toplam haber: {checked}, yeni: {found_new}")
            first_run = False
            time.sleep(interval_seconds)
    except KeyboardInterrupt:
        save_state(state_file, seen_ids)
        print("\nCikis yapildi. Durum kaydedildi.")


def run_once(
    keywords: list[str],
    lang: str,
    country: str,
    state_file: Path,
    notify_on_startup: bool,
) -> None:
    seen_ids = load_state(state_file)
    checked, found_new = poll_once(
        keywords=keywords,
        lang=lang,
        country=country,
        seen_ids=seen_ids,
        first_run=True,
        notify_on_startup=notify_on_startup,
    )
    save_state(state_file, seen_ids)
    print(f"Tek seferlik kontrol tamamlandi. Toplam haber: {checked}, yeni: {found_new}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Google News RSS ile belirli keywordler icin yeni haber takip araci."
    )
    parser.add_argument(
        "--keywords",
        type=str,
        default="",
        help="Virgulle ayrilmis keyword listesi. Ornek: 'Apple,Microsoft,Tesla'",
    )
    parser.add_argument(
        "--keywords-file",
        type=Path,
        default=Path("keywords.txt"),
        help="Her satirda bir keyword olan dosya. Varsayilan: keywords.txt",
    )
    parser.add_argument(
        "--merge-keywords-file",
        action="store_true",
        help="--keywords ile birlikte keywords dosyasini da birlestir.",
    )
    parser.add_argument(
        "--interval",
        type=int,
        default=300,
        help="Kac saniyede bir kontrol edilecegi. Varsayilan: 300",
    )
    parser.add_argument("--lang", type=str, default="tr", help="RSS dil kodu. Varsayilan: tr")
    parser.add_argument("--country", type=str, default="TR", help="RSS ulke kodu. Varsayilan: TR")
    parser.add_argument(
        "--state-file",
        type=Path,
        default=DEFAULT_STATE_FILE,
        help="Gorulmus haber ID'lerinin tutulacagi JSON dosyasi.",
    )
    parser.add_argument(
        "--notify-on-startup",
        action="store_true",
        help="Ilk calistirmada bulunan haberler icin de bildirim gonder.",
    )
    parser.add_argument(
        "--once",
        action="store_true",
        help="Surekli izleme yerine bir kez kontrol et ve cik.",
    )
    return parser.parse_args()


def main() -> int:
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

    args = parse_args()
    keywords_file = args.keywords_file if (not args.keywords or args.merge_keywords_file) else None
    keywords = load_keywords(args.keywords, keywords_file)

    if not keywords:
        print("Keyword bulunamadi. --keywords verin veya keywords.txt dosyasini doldurun.")
        return 1
    if args.interval < 30:
        print("Cok sik istek atmamak icin --interval en az 30 saniye olmali.")
        return 1

    if args.once:
        run_once(
            keywords=keywords,
            lang=args.lang,
            country=args.country,
            state_file=args.state_file,
            notify_on_startup=args.notify_on_startup,
        )
    else:
        run_loop(
            keywords=keywords,
            interval_seconds=args.interval,
            lang=args.lang,
            country=args.country,
            state_file=args.state_file,
            notify_on_startup=args.notify_on_startup,
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
