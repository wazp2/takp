# Google News RSS Sirket Haber Takip Araci

Bu arac belirttiginiz keyword'ler icin Google News RSS akisini periyodik kontrol eder.
Yeni haber buldugunda:
- terminale yazar
- `plyer` kuruluysa masaustu bildirimi gonderir

## Kurulum

```powershell
python -m pip install plyer
```

`plyer` zorunlu degil; kurulu degilse bildirimler terminale yazdirilir.

## Keyword listesi

`keywords.txt` icine her satira bir keyword yazin:

```text
Apple
Microsoft
Tesla
```

## Calistirma

```powershell
python news_watcher.py --interval 300
```

Ek olarak direkt komut satirindan keyword vermek icin:

```powershell
python news_watcher.py --keywords "Aselsan,TUPRAS,Garanti BBVA" --interval 300
```

Not: `--keywords` kullanildiginda varsayilan olarak `keywords.txt` birlestirilmez.
Ikisini birden kullanmak icin:

```powershell
python news_watcher.py --keywords "Aselsan,TUPRAS" --merge-keywords-file
```

Ilk acilista bulunan haberler icin de bildirim almak isterseniz:

```powershell
python news_watcher.py --notify-on-startup
```

Tek seferlik test:

```powershell
python news_watcher.py --once --notify-on-startup
```
