const dfp_post_url = '/1e3030042451f26781e0992c5bb8667d13681aea'
! function(e) {
    var i, t, n = function() {
        return i = (new(window.UAParser || exports.UAParser)).getResult(), t = new Detector, this
    };
    n.prototype = {
        getSoftwareVersion: function() {
            return "0.1.11"
        },
        getBrowserData: function() {
            return i
        },
        getFingerprint: function() {
            return murmurhash3_32_gc(i.ua + "|" + this.getScreenPrint() + "|" + this.getPlugins() + "|" + this.getFonts() + "|" + this.isLocalStorage() + "|" + this.isSessionStorage() + "|" + this.getTimeZone() + "|" + this.getLanguage() + "|" + this.getSystemLanguage() + "|" + this.isCookie() + "|" + this.getCanvasPrint(), 256)
        },
        getCustomFingerprint: function() {
            for (var e = "", i = 0; i < arguments.length; i++) e += arguments[i] + "|";
            return murmurhash3_32_gc(e, 256)
        },
        getUserAgent: function() {
            return i.ua.substring(0, Math.min(199, i.ua.length));
        },
        getUserAgentLowerCase: function() {
            return i.ua.toLowerCase()
        },
        getBrowser: function() {
            return i.browser.name
        },
        getBrowserVersion: function() {
            return i.browser.version
        },
        getBrowserMajorVersion: function() {
            return i.browser.major
        },
        isIE: function() {
            return /IE/i.test(i.browser.name)
        },
        isChrome: function() {
            return /Chrome/i.test(i.browser.name)
        },
        isFirefox: function() {
            return /Firefox/i.test(i.browser.name)
        },
        isSafari: function() {
            return /Safari/i.test(i.browser.name)
        },
        isMobileSafari: function() {
            return /Mobile\sSafari/i.test(i.browser.name)
        },
        isOpera: function() {
            return /Opera/i.test(i.browser.name)
        },
        getWebdriver: function() {
            let webdriver = navigator.webdriver;
            return webdriver;
        },

        getAppVersion: function() {
            let appVersion = navigator.appVersion;
            return appVersion;
        },

        getPluginsPrototype: function() {
            let correctPrototypes = PluginArray.prototype === navigator.plugins.__proto__;
            if (navigator.plugins.length > 0)
                correctPrototypes &= Plugin.prototype === navigator.plugins[0].__proto__;
            return Boolean(correctPrototypes);
        },

        getMimePrototype: function() {
            let correctPrototypes = MimeTypeArray.prototype === navigator.mimeTypes.__proto__;
            if (navigator.mimeTypes.length > 0)
                correctPrototypes &= MimeType.prototype === navigator.mimeTypes[0].__proto__;
            return Boolean(correctPrototypes);
        },

        getLanguagesLength: function() {
            let language = navigator.language;
            let languagesLength = navigator.languages.length;
            return (!language || languagesLength === 0)
        },

        getOuterValue: function() {
            let outerHeight = window.outerHeight;
            let outerWidth  = window.outerWidth;
            return (outerHeight === 0 || outerWidth === 0);
        },

        getEngine: function() {
            return i.engine.name
        },
        getEngineVersion: function() {
            return i.engine.version
        },
        getOS: function() {
            return i.os.name
        },
        getOSVersion: function() {
            return i.os.version
        },
        isWindows: function() {
            return /Windows/i.test(i.os.name)
        },
        isMac: function() {
            return /Mac/i.test(i.os.name)
        },
        isLinux: function() {
            return /Linux/i.test(i.os.name)
        },
        isUbuntu: function() {
            return /Ubuntu/i.test(i.os.name)
        },
        isSolaris: function() {
            return /Solaris/i.test(i.os.name)
        },
        getDevice: function() {
            return i.device.model
        },
        getDeviceType: function() {
            return i.device.type
        },
        getDeviceVendor: function() {
            return i.device.vendor
        },
        getCPU: function() {
            return i.cpu.architecture
        },
        isMobile: function() {
            var e = i.ua || navigator.vendor || window.opera;
            return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(e) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(e.substr(0, 4))
        },
        isMobileMajor: function() {
            return this.isMobileAndroid() || this.isMobileBlackBerry() || this.isMobileIOS() || this.isMobileOpera() || this.isMobileWindows()
        },
        isMobileAndroid: function() {
            return !!i.ua.match(/Android/i)
        },
        isMobileOpera: function() {
            return !!i.ua.match(/Opera Mini/i)
        },
        isMobileWindows: function() {
            return !!i.ua.match(/IEMobile/i)
        },
        isMobileBlackBerry: function() {
            return !!i.ua.match(/BlackBerry/i)
        },
        isMobileIOS: function() {
            return !!i.ua.match(/iPhone|iPad|iPod/i)
        },
        isIphone: function() {
            return !!i.ua.match(/iPhone/i)
        },
        isIpad: function() {
            return !!i.ua.match(/iPad/i)
        },
        isIpod: function() {
            return !!i.ua.match(/iPod/i)
        },
        getScreenPrint: function() {
            var t = "Current Resolution: " + this.getCurrentResolution() + ", Available Resolution: " + this.getAvailableResolution() + ", Color Depth: " + this.getColorDepth() + ", Device XDPI: " + this.getDeviceXDPI() + ", Device YDPI: " + this.getDeviceYDPI()
            return t.substring(0, Math.min(199, t.length))
        },
        getColorDepth: function() {
            return screen.colorDepth
        },
        getCurrentResolution: function() {
            return screen.width + "x" + screen.height
        },
        getAvailableResolution: function() {
            return screen.availWidth + "x" + screen.availHeight
        },
        getDeviceXDPI: function() {
            return screen.deviceXDPI
        },
        getDeviceYDPI: function() {
            return screen.deviceYDPI
        },
        getPlugins: function() {
            for (var e = "", i = 0; i < navigator.plugins.length; i++) e = i == navigator.plugins.length - 1 ? e + navigator.plugins[i].name : e + (navigator.plugins[i].name + ", ");
	    return e.substring(0, Math.min(99, e.length))
        },
        isJava: function() {
            return navigator.javaEnabled()
        },
        getJavaVersion: function() {
            return deployJava.getJREs().toString()
        },
        isFlash: function() {
            return !!navigator.plugins["Shockwave Flash"]
        },
        getFlashVersion: function() {
            return this.isFlash() ? (objPlayerVersion = swfobject.getFlashPlayerVersion(), objPlayerVersion.major + "." + objPlayerVersion.minor + "." + objPlayerVersion.release) : ""
        },
        isSilverlight: function() {
            return !!navigator.plugins["Silverlight Plug-In"]
        },
        getSilverlightVersion: function() {
            return this.isSilverlight() ? navigator.plugins["Silverlight Plug-In"].description : ""
        },
        isMimeTypes: function() {
            return !!navigator.mimeTypes.length
        },
        getMimeTypes: function() {
            for (var e = "", i = 0; i < navigator.mimeTypes.length; i++) e = i == navigator.mimeTypes.length - 1 ? e + navigator.mimeTypes[i].description : e + (navigator.mimeTypes[i].description + ", ");
            return e
        },
        isFont: function(e) {
            return t.detect(e)
        },
        getFonts: function() {
            for (var e = "Abadi MT Condensed Light;Adobe Fangsong Std;Adobe Hebrew;Adobe Ming Std;Agency FB;Aharoni;Andalus;Angsana New;AngsanaUPC;Aparajita;Arab;Arabic Transparent;Arabic Typesetting;Arial Baltic;Arial Black;Arial CE;Arial CYR;Arial Greek;Arial TUR;Arial;Batang;BatangChe;Bauhaus 93;Bell MT;Bitstream Vera Serif;Bodoni MT;Bookman Old Style;Braggadocio;Broadway;Browallia New;BrowalliaUPC;Calibri Light;Calibri;Californian FB;Cambria Math;Cambria;Candara;Castellar;Casual;Centaur;Century Gothic;Chalkduster;Colonna MT;Comic Sans MS;Consolas;Constantia;Copperplate Gothic Light;Corbel;Cordia New;CordiaUPC;Courier New Baltic;Courier New CE;Courier New CYR;Courier New Greek;Courier New TUR;Courier New;DFKai-SB;DaunPenh;David;DejaVu LGC Sans Mono;Desdemona;DilleniaUPC;DokChampa;Dotum;DotumChe;Ebrima;Engravers MT;Eras Bold ITC;Estrangelo Edessa;EucrosiaUPC;Euphemia;Eurostile;FangSong;Forte;FrankRuehl;Franklin Gothic Heavy;Franklin Gothic Medium;FreesiaUPC;French Script MT;Gabriola;Gautami;Georgia;Gigi;Gisha;Goudy Old Style;Gulim;GulimChe;GungSeo;Gungsuh;GungsuhChe;Haettenschweiler;Harrington;Hei S;HeiT;Heisei Kaku Gothic;Hiragino Sans GB;Impact;Informal Roman;IrisUPC;Iskoola Pota;JasmineUPC;KacstOne;KaiTi;Kalinga;Kartika;Khmer UI;Kino MT;KodchiangUPC;Kokila;Kozuka Gothic Pr6N;Lao UI;Latha;Leelawadee;Levenim MT;LilyUPC;Lohit Gujarati;Loma;Lucida Bright;Lucida Console;Lucida Fax;Lucida Sans Unicode;MS Gothic;MS Mincho;MS PGothic;MS PMincho;MS Reference Sans Serif;MS UI Gothic;MV Boli;Magneto;Malgun Gothic;Mangal;Marlett;Matura MT Script Capitals;Meiryo UI;Meiryo;Menlo;Microsoft Himalaya;Microsoft JhengHei;Microsoft New Tai Lue;Microsoft PhagsPa;Microsoft Sans Serif;Microsoft Tai Le;Microsoft Uighur;Microsoft YaHei;Microsoft Yi Baiti;MingLiU;MingLiU-ExtB;MingLiU_HKSCS;MingLiU_HKSCS-ExtB;Miriam Fixed;Miriam;Mongolian Baiti;MoolBoran;NSimSun;Narkisim;News Gothic MT;Niagara Solid;Nyala;PMingLiU;PMingLiU-ExtB;Palace Script MT;Palatino Linotype;Papyrus;Perpetua;Plantagenet Cherokee;Playbill;Prelude Bold;Prelude Condensed Bold;Prelude Condensed Medium;Prelude Medium;PreludeCompressedWGL Black;PreludeCompressedWGL Bold;PreludeCompressedWGL Light;PreludeCompressedWGL Medium;PreludeCondensedWGL Black;PreludeCondensedWGL Bold;PreludeCondensedWGL Light;PreludeCondensedWGL Medium;PreludeWGL Black;PreludeWGL Bold;PreludeWGL Light;PreludeWGL Medium;Raavi;Rachana;Rockwell;Rod;Sakkal Majalla;Sawasdee;Script MT Bold;Segoe Print;Segoe Script;Segoe UI Light;Segoe UI Semibold;Segoe UI Symbol;Segoe UI;Shonar Bangla;Showcard Gothic;Shruti;SimHei;SimSun;SimSun-ExtB;Simplified Arabic Fixed;Simplified Arabic;Snap ITC;Sylfaen;Symbol;Tahoma;Times New Roman Baltic;Times New Roman CE;Times New Roman CYR;Times New Roman Greek;Times New Roman TUR;Times New Roman;TlwgMono;Traditional Arabic;Trebuchet MS;Tunga;Tw Cen MT Condensed Extra Bold;Ubuntu;Umpush;Univers;Utopia;Utsaah;Vani;Verdana;Vijaya;Vladimir Script;Vrinda;Webdings;Wide Latin;Wingdings".split(";"), i = "", n = 0; n < e.length; n++) t.detect(e[n]) && (i = n == e.length - 1 ? i + e[n] : i + (e[n] + ", "));
            return i.substring(0, Math.min(2499, i.length));
        },
        isLocalStorage: function() {
            try {
                return !!e.localStorage
            } catch (e) {
                return !0
            }
        },
        isSessionStorage: function() {
            try {
                return !!e.sessionStorage
            } catch (e) {
                return !0
            }
        },
        isCookie: function() {
            return navigator.cookieEnabled
        },
        getTimeZone: function() {
            return String(String(new Date).split("(")[1]).split(")")[0]
        },
        getLanguage: function() {
            return navigator.language
        },
        getSystemLanguage: function() {
            return navigator.systemLanguage
        },
        isCanvas: function() {
            var e = document.createElement("canvas");
            try {
                return !(!e.getContext || !e.getContext("2d"))
            } catch (e) {
                return !1
            }
        },
        getCanvasPrint: function() {
            var e, i = document.createElement("canvas");
            try {
                e = i.getContext("2d");
            } catch (e) {
                return ""
            }
            return e.textBaseline = "top", e.font = "14px 'Arial'", e.textBaseline = "alphabetic", e.fillStyle = "#f60", e.fillRect(125, 1, 62, 20), e.fillStyle = "#069", e.fillText("ClientJS,org <canvas> 1.0", 2, 15), e.fillStyle = "rgba(102, 204, 0, 0.7)", e.fillText("ClientJS,org <canvas> 1.0", 4, 17), i.toDataURL().substring(0, Math.min(9999, i.toDataURL().length));
        }
    }, "object" == typeof module && "undefined" != typeof exports && (module.exports = n), e.ClientJS = n
}(window);
var deployJava = function() {
        function e(e) {
            a.debug && (console.log ? console.log(e) : alert(e))
        }

        function i(e) {
            return null == e || 0 == e.length ? "http://java.com/dt-redirect" : ("&" == e.charAt(0) && (e = e.substring(1, e.length)), "http://java.com/dt-redirect?" + e)
        }
        var t = ["id", "class", "title", "style"];
        "classid codebase codetype data type archive declare standby height width usemap name tabindex align border hspace vspace".split(" ").concat(t, ["lang", "dir"], "onclick ondblclick onmousedown onmouseup onmouseover onmousemove onmouseout onkeypress onkeydown onkeyup".split(" "));
        var n, r = "codebase code name archive object width height alt align hspace vspace".split(" ").concat(t);
        try {
            n = -1 != document.location.protocol.indexOf("http") ? "//java.com/js/webstart.png" : "http://java.com/js/webstart.png"
        } catch (e) {
            n = "http://java.com/js/webstart.png"
        }
        var a = {
            debug: null,
            version: "20120801",
            firefoxJavaVersion: null,
            myInterval: null,
            preInstallJREList: null,
            returnPage: null,
            brand: null,
            locale: null,
            installType: null,
            EAInstallEnabled: !1,
            EarlyAccessURL: null,
            oldMimeType: "application/npruntime-scriptable-plugin;DeploymentToolkit",
            mimeType: "application/java-deployment-toolkit",
            launchButtonPNG: n,
            browserName: null,
            browserName2: null,
            getJREs: function() {
                var i = [];
                if (this.isPluginInstalled())
                    for (var t = this.getPlugin().jvms, n = 0; n < t.getLength(); n++) i[n] = t.get(n).version;
                else t = this.getBrowser(), "MSIE" == t ? this.testUsingActiveX("1.7.0") ? i[0] = "1.7.0" : this.testUsingActiveX("1.6.0") ? i[0] = "1.6.0" : this.testUsingActiveX("1.5.0") ? i[0] = "1.5.0" : this.testUsingActiveX("1.4.2") ? i[0] = "1.4.2" : this.testForMSVM() && (i[0] = "1.1") : "Netscape Family" == t && (this.getJPIVersionUsingMimeType(), null != this.firefoxJavaVersion ? i[0] = this.firefoxJavaVersion : this.testUsingMimeTypes("1.7") ? i[0] = "1.7.0" : this.testUsingMimeTypes("1.6") ? i[0] = "1.6.0" : this.testUsingMimeTypes("1.5") ? i[0] = "1.5.0" : this.testUsingMimeTypes("1.4.2") ? i[0] = "1.4.2" : "Safari" == this.browserName2 && (this.testUsingPluginsArray("1.7.0") ? i[0] = "1.7.0" : this.testUsingPluginsArray("1.6") ? i[0] = "1.6.0" : this.testUsingPluginsArray("1.5") ? i[0] = "1.5.0" : this.testUsingPluginsArray("1.4.2") && (i[0] = "1.4.2")));
                if (this.debug)
                    for (n = 0; n < i.length; ++n) e("[getJREs()] We claim to have detected Java SE " + i[n]);
                return i
            },
            installJRE: function(e, i) {
                if (this.isPluginInstalled() && this.isAutoInstallEnabled(e)) {
                    var t;
                    return (t = this.isCallbackSupported() ? this.getPlugin().installJRE(e, i) : this.getPlugin().installJRE(e)) && (this.refresh(), null != this.returnPage && (document.location = this.returnPage)), t
                }
                return this.installLatestJRE()
            },
            isAutoInstallEnabled: function(e) {
                if (!this.isPluginInstalled()) return !1;
                if (void 0 === e && (e = null), "MSIE" != deployJava.browserName || deployJava.compareVersionToPattern(deployJava.getPlugin().version, ["10", "0", "0"], !1, !0)) e = !0;
                else if (null == e) e = !1;
                else {
                    var i = "1.6.0_33+";
                    if (null == i || 0 == i.length) e = !0;
                    else {
                        var t = i.charAt(i.length - 1);
                        if ("+" != t && "*" != t && -1 != i.indexOf("_") && "_" != t && (i += "*", t = "*"), 0 < (i = i.substring(0, i.length - 1)).length) {
                            var n = i.charAt(i.length - 1);
                            "." != n && "_" != n || (i = i.substring(0, i.length - 1))
                        }
                        e = "*" == t ? 0 == e.indexOf(i) : "+" == t && i <= e
                    }
                    e = !e
                }
                return e
            },
            isCallbackSupported: function() {
                return this.isPluginInstalled() && this.compareVersionToPattern(this.getPlugin().version, ["10", "2", "0"], !1, !0)
            },
            installLatestJRE: function(e) {
                if (this.isPluginInstalled() && this.isAutoInstallEnabled()) {
                    var t = !1;
                    return (t = this.isCallbackSupported() ? this.getPlugin().installLatestJRE(e) : this.getPlugin().installLatestJRE()) && (this.refresh(), null != this.returnPage && (document.location = this.returnPage)), t
                }
                if (e = this.getBrowser(), t = navigator.platform.toLowerCase(), "true" == this.EAInstallEnabled && -1 != t.indexOf("win") && null != this.EarlyAccessURL) this.preInstallJREList = this.getJREs(), null != this.returnPage && (this.myInterval = setInterval("deployJava.poll()", 3e3)), location.href = this.EarlyAccessURL;
                else {
                    if ("MSIE" == e) return this.IEInstall();
                    if ("Netscape Family" == e && -1 != t.indexOf("win32")) return this.FFInstall();
                    location.href = i((null != this.returnPage ? "&returnPage=" + this.returnPage : "") + (null != this.locale ? "&locale=" + this.locale : "") + (null != this.brand ? "&brand=" + this.brand : ""))
                }
                return !1
            },
            runApplet: function(i, t, n) {
                "undefined" != n && null != n || (n = "1.1");
                var r = n.match("^(\\d+)(?:\\.(\\d+)(?:\\.(\\d+)(?:_(\\d+))?)?)?$");
                null == this.returnPage && (this.returnPage = document.location), null != r ? "?" != this.getBrowser() ? this.versionCheck(n + "+") ? this.writeAppletTag(i, t) : this.installJRE(n + "+") && (this.refresh(), location.href = document.location, this.writeAppletTag(i, t)) : this.writeAppletTag(i, t) : e("[runApplet()] Invalid minimumVersion argument to runApplet():" + n)
            },
            writeAppletTag: function(e, i) {
                var t = "<applet ",
                    n = "",
                    a = !0;
                null != i && "object" == typeof i || (i = {});
                for (var o in e) {
                    var s;
                    e: {
                        s = o.toLowerCase();
                        for (var l = r.length, u = 0; u < l; u++)
                            if (r[u] === s) {
                                s = !0;
                                break e
                            } s = !1
                    }
                    s ? (t += " " + o + '="' + e[o] + '"', "code" == o && (a = !1)) : i[o] = e[o]
                }
                o = !1;
                for (var c in i) "codebase_lookup" == c && (o = !0), "object" != c && "java_object" != c && "java_code" != c || (a = !1), n += '<param name="' + c + '" value="' + i[c] + '"/>';
                o || (n += '<param name="codebase_lookup" value="false"/>'), a && (t += ' code="dummy"'), document.write(t + ">\n" + n + "\n</applet>")
            },
            versionCheck: function(i) {
                var t = 0,
                    n = i.match("^(\\d+)(?:\\.(\\d+)(?:\\.(\\d+)(?:_(\\d+))?)?)?(\\*|\\+)?$");
                if (null != n) {
                    for (var r = i = !1, a = [], o = 1; o < n.length; ++o) "string" == typeof n[o] && "" != n[o] && (a[t] = n[o], t++);
                    for ("+" == a[a.length - 1] ? (r = !0, i = !1, a.length--) : "*" == a[a.length - 1] ? (r = !1, i = !0, a.length--) : 4 > a.length && (r = !1, i = !0), t = this.getJREs(), o = 0; o < t.length; ++o)
                        if (this.compareVersionToPattern(t[o], a, i, r)) return !0
                } else t = "Invalid versionPattern passed to versionCheck: " + i, e("[versionCheck()] " + t), alert(t);
                return !1
            },
            isWebStartInstalled: function(i) {
                if ("?" == this.getBrowser()) return !0;
                "undefined" != i && null != i || (i = "1.4.2");
                var t = !1;
                return null != i.match("^(\\d+)(?:\\.(\\d+)(?:\\.(\\d+)(?:_(\\d+))?)?)?$") ? t = this.versionCheck(i + "+") : (e("[isWebStartInstaller()] Invalid minimumVersion argument to isWebStartInstalled(): " + i), t = this.versionCheck("1.4.2+")), t
            },
            getJPIVersionUsingMimeType: function() {
                for (var e = 0; e < navigator.mimeTypes.length; ++e) {
                    var i = navigator.mimeTypes[e].type.match(/^application\/x-java-applet;jpi-version=(.*)$/);
                    if (null != i && (this.firefoxJavaVersion = i[1], "Opera" != this.browserName2)) break
                }
            },
            launchWebStartApplication: function(e) {
                if (navigator.userAgent.toLowerCase(), this.getJPIVersionUsingMimeType(), 0 == this.isWebStartInstalled("1.7.0") && (0 == this.installJRE("1.7.0+") || 0 == this.isWebStartInstalled("1.7.0"))) return !1;
                var i = null;
                document.documentURI && (i = document.documentURI), null == i && (i = document.URL);
                var t, n = this.getBrowser();
                "MSIE" == n ? t = '<object classid="clsid:8AD9C840-044E-11D1-B3E9-00805F499D93" width="0" height="0"><PARAM name="launchjnlp" value="' + e + '"><PARAM name="docbase" value="' + i + '"></object>' : "Netscape Family" == n && (t = '<embed type="application/x-java-applet;jpi-version=' + this.firefoxJavaVersion + '" width="0" height="0" launchjnlp="' + e + '"docbase="' + i + '" />'), "undefined" == document.body || null == document.body ? (document.write(t), document.location = i) : ((e = document.createElement("div")).id = "div1", e.style.position = "relative", e.style.left = "-10000px", e.style.margin = "0px auto", e.className = "dynamicDiv", e.innerHTML = t, document.body.appendChild(e))
            },
            createWebStartLaunchButtonEx: function(e, i) {
                null == this.returnPage && (this.returnPage = e), document.write("<a href=\"javascript:deployJava.launchWebStartApplication('" + e + '\');" onMouseOver="window.status=\'\'; return true;"><img src="' + this.launchButtonPNG + '" border="0" /></a>')
            },
            createWebStartLaunchButton: function(e, i) {
                null == this.returnPage && (this.returnPage = e), document.write('<a href="javascript:if (!deployJava.isWebStartInstalled(&quot;' + i + "&quot;)) {if (deployJava.installLatestJRE()) {if (deployJava.launch(&quot;" + e + "&quot;)) {}}} else {if (deployJava.launch(&quot;" + e + '&quot;)) {}}" onMouseOver="window.status=\'\'; return true;"><img src="' + this.launchButtonPNG + '" border="0" /></a>')
            },
            launch: function(e) {
                return document.location = e, !0
            },
            isPluginInstalled: function() {
                var e = this.getPlugin();
                return !(!e || !e.jvms)
            },
            isAutoUpdateEnabled: function() {
                return !!this.isPluginInstalled() && this.getPlugin().isAutoUpdateEnabled()
            },
            setAutoUpdateEnabled: function() {
                return !!this.isPluginInstalled() && this.getPlugin().setAutoUpdateEnabled()
            },
            setInstallerType: function(e) {
                return this.installType = e, !!this.isPluginInstalled() && this.getPlugin().setInstallerType(e)
            },
            setAdditionalPackages: function(e) {
                return !!this.isPluginInstalled() && this.getPlugin().setAdditionalPackages(e)
            },
            setEarlyAccess: function(e) {
                this.EAInstallEnabled = e
            },
            isPlugin2: function() {
                if (this.isPluginInstalled() && this.versionCheck("1.6.0_10+")) try {
                    return this.getPlugin().isPlugin2()
                } catch (e) {}
                return !1
            },
            allowPlugin: function() {
                return this.getBrowser(), "Safari" != this.browserName2 && "Opera" != this.browserName2
            },
            getPlugin: function() {
                this.refresh();
                var e = null;
                return this.allowPlugin() && (e = document.getElementById("deployJavaPlugin")), e
            },
            compareVersionToPattern: function(e, i, t, n) {
                if (void 0 == e || void 0 == i) return !1;
                var r = e.match("^(\\d+)(?:\\.(\\d+)(?:\\.(\\d+)(?:_(\\d+))?)?)?$");
                if (null != r) {
                    var a = 0;
                    e = [];
                    for (var o = 1; o < r.length; ++o) "string" == typeof r[o] && "" != r[o] && (e[a] = r[o], a++);
                    if (r = Math.min(e.length, i.length), n) {
                        for (o = 0; o < r; ++o) {
                            if (e[o] < i[o]) return !1;
                            if (e[o] > i[o]) break
                        }
                        return !0
                    }
                    for (o = 0; o < r; ++o)
                        if (e[o] != i[o]) return !1;
                    return !!t || e.length == i.length
                }
                return !1
            },
            getBrowser: function() {
                if (null == this.browserName) {
                    var i = navigator.userAgent.toLowerCase();
                    e("[getBrowser()] navigator.userAgent.toLowerCase() -> " + i), -1 != i.indexOf("msie") && -1 == i.indexOf("opera") ? this.browserName2 = this.browserName = "MSIE" : -1 != i.indexOf("iphone") ? (this.browserName = "Netscape Family", this.browserName2 = "iPhone") : -1 != i.indexOf("firefox") && -1 == i.indexOf("opera") ? (this.browserName = "Netscape Family", this.browserName2 = "Firefox") : -1 != i.indexOf("chrome") ? (this.browserName = "Netscape Family", this.browserName2 = "Chrome") : -1 != i.indexOf("safari") ? (this.browserName = "Netscape Family", this.browserName2 = "Safari") : -1 != i.indexOf("mozilla") && -1 == i.indexOf("opera") ? (this.browserName = "Netscape Family", this.browserName2 = "Other") : -1 != i.indexOf("opera") ? (this.browserName = "Netscape Family", this.browserName2 = "Opera") : (this.browserName = "?", this.browserName2 = "unknown"), e("[getBrowser()] Detected browser name:" + this.browserName + ", " + this.browserName2)
                }
                return this.browserName
            },
            testUsingActiveX: function(i) {
                if (i = "JavaWebStart.isInstalled." + i + ".0", "undefined" == typeof ActiveXObject || !ActiveXObject) return e("[testUsingActiveX()] Browser claims to be IE, but no ActiveXObject object?"), !1;
                try {
                    return null != new ActiveXObject(i)
                } catch (e) {
                    return !1
                }
            },
            testForMSVM: function() {
                if ("undefined" != typeof oClientCaps) {
                    var e = oClientCaps.getComponentVersion("{08B0E5C0-4FCB-11CF-AAA5-00401C608500}", "ComponentID");
                    return "" != e && "5,0,5000,0" != e
                }
                return !1
            },
            testUsingMimeTypes: function(i) {
                if (!navigator.mimeTypes) return e("[testUsingMimeTypes()] Browser claims to be Netscape family, but no mimeTypes[] array?"), !1;
                for (var t = 0; t < navigator.mimeTypes.length; ++t) {
                    s = navigator.mimeTypes[t].type;
                    var n = s.match(/^application\/x-java-applet\x3Bversion=(1\.8|1\.7|1\.6|1\.5|1\.4\.2)$/);
                    if (null != n && this.compareVersions(n[1], i)) return !0
                }
                return !1
            },
            testUsingPluginsArray: function(e) {
                if (!navigator.plugins || !navigator.plugins.length) return !1;
                for (var i = navigator.platform.toLowerCase(), t = 0; t < navigator.plugins.length; ++t)
                    if (s = navigator.plugins[t].description, -1 != s.search(/^Java Switchable Plug-in (Cocoa)/)) {
                        if (this.compareVersions("1.5.0", e)) return !0
                    } else if (-1 != s.search(/^Java/) && -1 != i.indexOf("win") && (this.compareVersions("1.5.0", e) || this.compareVersions("1.6.0", e))) return !0;
                return !!this.compareVersions("1.5.0", e)
            },
            IEInstall: function() {
                return location.href = i((null != this.returnPage ? "&returnPage=" + this.returnPage : "") + (null != this.locale ? "&locale=" + this.locale : "") + (null != this.brand ? "&brand=" + this.brand : "")), !1
            },
            done: function(e, i) {},
            FFInstall: function() {
                return location.href = i((null != this.returnPage ? "&returnPage=" + this.returnPage : "") + (null != this.locale ? "&locale=" + this.locale : "") + (null != this.brand ? "&brand=" + this.brand : "") + (null != this.installType ? "&type=" + this.installType : "")), !1
            },
            compareVersions: function(e, i) {
                for (var t = e.split("."), n = i.split("."), r = 0; r < t.length; ++r) t[r] = Number(t[r]);
                for (r = 0; r < n.length; ++r) n[r] = Number(n[r]);
                return 2 == t.length && (t[2] = 0), t[0] > n[0] || !(t[0] < n[0]) && (t[1] > n[1] || !(t[1] < n[1]) && (t[2] > n[2] || !(t[2] < n[2])))
            },
            enableAlerts: function() {
                this.browserName = null, this.debug = !0
            },
            poll: function() {
                this.refresh();
                var e = this.getJREs();
                0 == this.preInstallJREList.length && 0 != e.length && (clearInterval(this.myInterval), null != this.returnPage && (location.href = this.returnPage)), 0 != this.preInstallJREList.length && 0 != e.length && this.preInstallJREList[0] != e[0] && (clearInterval(this.myInterval), null != this.returnPage && (location.href = this.returnPage))
            },
            writePluginTag: function() {
                var e = this.getBrowser();
                "MSIE" == e ? document.write('<object classid="clsid:CAFEEFAC-DEC7-0000-0001-ABCDEFFEDCBA" id="deployJavaPlugin" width="0" height="0"></object>') : "Netscape Family" == e && this.allowPlugin() && this.writeEmbedTag()
            },
            refresh: function() {
                navigator.plugins.refresh(!1), "Netscape Family" == this.getBrowser() && this.allowPlugin() && null == document.getElementById("deployJavaPlugin") && this.writeEmbedTag()
            },
            writeEmbedTag: function() {
                var e = !1;
                if (null != navigator.mimeTypes) {
                    for (var i = 0; i < navigator.mimeTypes.length; i++) navigator.mimeTypes[i].type == this.mimeType && navigator.mimeTypes[i].enabledPlugin && (document.write('<embed id="deployJavaPlugin" type="' + this.mimeType + '" hidden="true" />'), e = !0);
                    if (!e)
                        for (i = 0; i < navigator.mimeTypes.length; i++) navigator.mimeTypes[i].type == this.oldMimeType && navigator.mimeTypes[i].enabledPlugin && document.write('<embed id="deployJavaPlugin" type="' + this.oldMimeType + '" hidden="true" />')
                }
            }
        };
        if (a.writePluginTag(), null == a.locale) {
            if (null == (t = null)) try {
                t = navigator.userLanguage
            } catch (e) {}
            if (null == t) try {
                t = navigator.systemLanguage
            } catch (e) {}
            if (null == t) try {
                t = navigator.language
            } catch (e) {}
            null != t && (t.replace("-", "_"), a.locale = t)
        }
        return a
    }(),
    Detector = function() {
        var e = ["monospace", "sans-serif", "serif"],
            i = document.getElementsByTagName("body")[0],
            t = document.createElement("span");
        t.style.fontSize = "72px", t.innerHTML = "mmmmmmmmmmlli";
        var n, r = {},
            a = {};
        for (n in e) t.style.fontFamily = e[n], i.appendChild(t), r[e[n]] = t.offsetWidth, a[e[n]] = t.offsetHeight, i.removeChild(t);
        this.detect = function(n) {
            var o, s = !1;
            for (o in e) {
                t.style.fontFamily = n + "," + e[o], i.appendChild(t);
                var l = t.offsetWidth != r[e[o]] || t.offsetHeight != a[e[o]];
                i.removeChild(t), s = s || l
            }
            return s
        }
    };

function murmurhash3_32_gc(e, i) {
    var t, n, r, a, o;
    for (t = 3 & e.length, n = e.length - t, r = i, o = 0; o < n;) a = 255 & e.charCodeAt(o) | (255 & e.charCodeAt(++o)) << 8 | (255 & e.charCodeAt(++o)) << 16 | (255 & e.charCodeAt(++o)) << 24, ++o, a = 3432918353 * (65535 & a) + ((3432918353 * (a >>> 16) & 65535) << 16) & 4294967295, a = a << 15 | a >>> 17, a = 461845907 * (65535 & a) + ((461845907 * (a >>> 16) & 65535) << 16) & 4294967295, r ^= a, r = r << 13 | r >>> 19, r = 5 * (65535 & r) + ((5 * (r >>> 16) & 65535) << 16) & 4294967295, r = 27492 + (65535 & r) + ((58964 + (r >>> 16) & 65535) << 16);
    switch (a = 0, t) {
        case 3:
            a ^= (255 & e.charCodeAt(o + 2)) << 16;
        case 2:
            a ^= (255 & e.charCodeAt(o + 1)) << 8;
        case 1:
            r ^= 461845907 * (65535 & (a = (a = 3432918353 * (65535 & (a ^= 255 & e.charCodeAt(o))) + ((3432918353 * (a >>> 16) & 65535) << 16) & 4294967295) << 15 | a >>> 17)) + ((461845907 * (a >>> 16) & 65535) << 16) & 4294967295
    }
    return r ^= e.length, r = 2246822507 * (65535 & (r ^= r >>> 16)) + ((2246822507 * (r >>> 16) & 65535) << 16) & 4294967295, ((r = 3266489909 * (65535 & (r ^= r >>> 13)) + ((3266489909 * (r >>> 16) & 65535) << 16) & 4294967295) ^ r >>> 16) >>> 0
}
function SHA1(msg) {
    function rotate_left(n, s) {
        var t4 = (n << s) | (n >>> (32 - s));
        return t4;
    };
    function lsb_hex(val) {
        var str = "";
        var i;
        var vh;
        var vl;
        for (i = 0; i <= 6; i += 2) {
            vh = (val >>> (i * 4 + 4)) & 0x0f;
            vl = (val >>> (i * 4)) & 0x0f;
            str += vh.toString(16) + vl.toString(16);
        }
        return str;
    };
    function cvt_hex(val) {
        var str = "";
        var i;
        var v;
        for (i = 7; i >= 0; i--) {
            v = (val >>> (i * 4)) & 0x0f;
            str += v.toString(16);
        }
        return str;
    };
    function Utf8Encode(string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    };
    var blockstart;
    var i, j;
    var W = new Array(80);
    var H0 = 0x67452301;
    var H1 = 0xEFCDAB89;
    var H2 = 0x98BADCFE;
    var H3 = 0x10325476;
    var H4 = 0xC3D2E1F0;
    var A, B, C, D, E;
    var temp;
    msg = Utf8Encode(msg);
    var msg_len = msg.length;
    var word_array = new Array();
    for (i = 0; i < msg_len - 3; i += 4) {
        j = msg.charCodeAt(i) << 24 | msg.charCodeAt(i + 1) << 16 |
            msg.charCodeAt(i + 2) << 8 | msg.charCodeAt(i + 3);
        word_array.push(j);
    }
    switch (msg_len % 4) {
        case 0:
            i = 0x080000000;
            break;
        case 1:
            i = msg.charCodeAt(msg_len - 1) << 24 | 0x0800000;
            break;
        case 2:
            i = msg.charCodeAt(msg_len - 2) << 24 | msg.charCodeAt(msg_len - 1) << 16 | 0x08000;
            break;
        case 3:
            i = msg.charCodeAt(msg_len - 3) << 24 | msg.charCodeAt(msg_len - 2) << 16 | msg.charCodeAt(msg_len - 1) << 8 | 0x80;
            break;
    }
    word_array.push(i);
    while ((word_array.length % 16) != 14) word_array.push(0);
    word_array.push(msg_len >>> 29);
    word_array.push((msg_len << 3) & 0x0ffffffff);
    for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {
        for (i = 0; i < 16; i++) W[i] = word_array[blockstart + i];
        for (i = 16; i <= 79; i++) W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
        A = H0;
        B = H1;
        C = H2;
        D = H3;
        E = H4;
        for (i = 0; i <= 19; i++) {
            temp = (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }
        for (i = 20; i <= 39; i++) {
            temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }
        for (i = 40; i <= 59; i++) {
            temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }
        for (i = 60; i <= 79; i++) {
            temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }
        H0 = (H0 + A) & 0x0ffffffff;
        H1 = (H1 + B) & 0x0ffffffff;
        H2 = (H2 + C) & 0x0ffffffff;
        H3 = (H3 + D) & 0x0ffffffff;
        H4 = (H4 + E) & 0x0ffffffff;
    }
    var temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
    return temp.toLowerCase();
}
var swfobject = function() {
    function e() {
        if (!x) {
            try {
                (e = P.getElementsByTagName("body")[0].appendChild(P.createElement("span"))).parentNode.removeChild(e)
            } catch (e) {
                return
            }
            x = !0;
            for (var e = E.length, i = 0; i < e; i++) E[i]()
        }
    }

    function i(e) {
        x ? e() : E[E.length] = e
    }

    function t(e) {
        if (void 0 !== C.addEventListener) C.addEventListener("load", e, !1);
        else if (void 0 !== P.addEventListener) P.addEventListener("load", e, !1);
        else if (void 0 !== C.attachEvent) t = C, n = "onload", r = e, t.attachEvent(n, r), I[I.length] = [t, n, r];
        else if ("function" == typeof C.onload) {
            var i = C.onload;
            C.onload = function() {
                i(), e()
            }
        } else C.onload = e;
        var t, n, r
    }

    function n() {
        var e = T.length;
        if (0 < e)
            for (var i = 0; i < e; i++) {
                var t = T[i].id,
                    n = T[i].callbackFn,
                    l = {
                        success: !1,
                        id: t
                    };
                if (0 < N.pv[0]) {
                    if (u = d(t))
                        if (!m(T[i].swfVersion) || N.wk && 312 > N.wk)
                            if (T[i].expressInstall && a()) {
                                (l = {}).data = T[i].expressInstall, l.width = u.getAttribute("width") || "0", l.height = u.getAttribute("height") || "0", u.getAttribute("class") && (l.styleclass = u.getAttribute("class")), u.getAttribute("align") && (l.align = u.getAttribute("align"));
                                for (var u, c = {}, g = (u = u.getElementsByTagName("param")).length, p = 0; p < g; p++) "movie" != u[p].getAttribute("name").toLowerCase() && (c[u[p].getAttribute("name")] = u[p].getAttribute("value"));
                                o(l, c, t, n)
                            } else s(u), n && n(l);
                    else h(t, !0), n && (l.success = !0, l.ref = r(t), n(l))
                } else h(t, !0), n && ((t = r(t)) && void 0 !== t.SetVariable && (l.success = !0, l.ref = t), n(l))
            }
    }

    function r(e) {
        var i = null;
        return (e = d(e)) && "OBJECT" == e.nodeName && (void 0 !== e.SetVariable ? i = e : (e = e.getElementsByTagName("object")[0]) && (i = e)), i
    }

    function a() {
        return !B && m("6.0.65") && (N.win || N.mac) && !(N.wk && 312 > N.wk)
    }

    function o(e, i, t, n) {
        B = !0, w = n || null, b = {
            success: !1,
            id: t
        };
        var r = d(t);
        r && ("OBJECT" == r.nodeName ? (v = l(r), f = null) : (v = r, f = t), e.id = "SWFObjectExprInst", (void 0 === e.width || !/%$/.test(e.width) && 310 > parseInt(e.width, 10)) && (e.width = "310"), (void 0 === e.height || !/%$/.test(e.height) && 137 > parseInt(e.height, 10)) && (e.height = "137"), P.title = P.title.slice(0, 47) + " - Flash Player Installation", n = N.ie && N.win ? "ActiveX" : "PlugIn", n = "MMredirectURL=" + C.location.toString().replace(/&/g, "%26") + "&MMplayerType=" + n + "&MMdoctitle=" + P.title, i.flashvars = void 0 !== i.flashvars ? i.flashvars + "&" + n : n, N.ie && N.win && 4 != r.readyState && (t += "SWFObjectNew", (n = P.createElement("div")).setAttribute("id", t), r.parentNode.insertBefore(n, r), r.style.display = "none", function() {
            4 == r.readyState ? r.parentNode.removeChild(r) : setTimeout(arguments.callee, 10)
        }()), u(e, i, t))
    }

    function s(e) {
        if (N.ie && N.win && 4 != e.readyState) {
            var i = P.createElement("div");
            e.parentNode.insertBefore(i, e), i.parentNode.replaceChild(l(e), i), e.style.display = "none",
                function() {
                    4 == e.readyState ? e.parentNode.removeChild(e) : setTimeout(arguments.callee, 10)
                }()
        } else e.parentNode.replaceChild(l(e), e)
    }

    function l(e) {
        var i = P.createElement("div");
        if (N.win && N.ie) i.innerHTML = e.innerHTML;
        else if ((e = e.getElementsByTagName("object")[0]) && (e = e.childNodes))
            for (var t = e.length, n = 0; n < t; n++) 1 == e[n].nodeType && "PARAM" == e[n].nodeName || 8 == e[n].nodeType || i.appendChild(e[n].cloneNode(!0));
        return i
    }

    function u(e, i, t) {
        var n, r = d(t);
        if (N.wk && 312 > N.wk) return n;
        if (r)
            if (void 0 === e.id && (e.id = t), N.ie && N.win) {
                var a, o = "";
                for (a in e) e[a] != Object.prototype[a] && ("data" == a.toLowerCase() ? i.movie = e[a] : "styleclass" == a.toLowerCase() ? o += ' class="' + e[a] + '"' : "classid" != a.toLowerCase() && (o += " " + a + '="' + e[a] + '"'));
                a = "";
                for (var s in i) i[s] != Object.prototype[s] && (a += '<param name="' + s + '" value="' + i[s] + '" />');
                r.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + o + ">" + a + "</object>", k[k.length] = e.id, n = d(e.id)
            } else {
                (s = P.createElement("object")).setAttribute("type", "application/x-shockwave-flash");
                for (var l in e) e[l] != Object.prototype[l] && ("styleclass" == l.toLowerCase() ? s.setAttribute("class", e[l]) : "classid" != l.toLowerCase() && s.setAttribute(l, e[l]));
                for (o in i) i[o] != Object.prototype[o] && "movie" != o.toLowerCase() && (e = s, a = o, l = i[o], t = P.createElement("param"), t.setAttribute("name", a), t.setAttribute("value", l), e.appendChild(t));
                r.parentNode.replaceChild(s, r), n = s
            } return n
    }

    function c(e) {
        var i = d(e);
        i && "OBJECT" == i.nodeName && (N.ie && N.win ? (i.style.display = "none", function() {
            if (4 == i.readyState) {
                var t = d(e);
                if (t) {
                    for (var n in t) "function" == typeof t[n] && (t[n] = null);
                    t.parentNode.removeChild(t)
                }
            } else setTimeout(arguments.callee, 10)
        }()) : i.parentNode.removeChild(i))
    }

    function d(e) {
        var i = null;
        try {
            i = P.getElementById(e)
        } catch (e) {}
        return i
    }

    function m(e) {
        var i = N.pv;
        return (e = e.split("."))[0] = parseInt(e[0], 10), e[1] = parseInt(e[1], 10) || 0, e[2] = parseInt(e[2], 10) || 0, i[0] > e[0] || i[0] == e[0] && i[1] > e[1] || i[0] == e[0] && i[1] == e[1] && i[2] >= e[2]
    }

    function g(e, i, t, n) {
        if (!N.ie || !N.mac) {
            var r = P.getElementsByTagName("head")[0];
            r && (t = t && "string" == typeof t ? t : "screen", n && (S = y = null), y && S == t || ((n = P.createElement("style")).setAttribute("type", "text/css"), n.setAttribute("media", t), y = r.appendChild(n), N.ie && N.win && void 0 !== P.styleSheets && 0 < P.styleSheets.length && (y = P.styleSheets[P.styleSheets.length - 1]), S = t), N.ie && N.win ? y && "object" == typeof y.addRule && y.addRule(e, i) : y && void 0 !== P.createTextNode && y.appendChild(P.createTextNode(e + " {" + i + "}")))
        }
    }

    function h(e, i) {
        if (L) {
            var t = i ? "visible" : "hidden";
            x && d(e) ? d(e).style.visibility = t : g("#" + e, "visibility:" + t)
        }
    }

    function p(e) {
        return null != /[\\\"<>\.;]/.exec(e) && "undefined" != typeof encodeURIComponent ? encodeURIComponent(e) : e
    }
    var v, f, w, b, y, S, C = window,
        P = document,
        M = navigator,
        A = !1,
        E = [function() {
            A ? function() {
                var e = P.getElementsByTagName("body")[0],
                    i = P.createElement("object");
                i.setAttribute("type", "application/x-shockwave-flash");
                var t = e.appendChild(i);
                if (t) {
                    var r = 0;
                    ! function() {
                        if (void 0 !== t.GetVariable) {
                            var a = t.GetVariable("$version");
                            a && (a = a.split(" ")[1].split(","), N.pv = [parseInt(a[0], 10), parseInt(a[1], 10), parseInt(a[2], 10)])
                        } else if (10 > r) return r++, void setTimeout(arguments.callee, 10);
                        e.removeChild(i), t = null, n()
                    }()
                } else n()
            }() : n()
        }],
        T = [],
        k = [],
        I = [],
        x = !1,
        B = !1,
        L = !0,
        N = function() {
            var e = void 0 !== P.getElementById && void 0 !== P.getElementsByTagName && void 0 !== P.createElement,
                i = M.userAgent.toLowerCase(),
                t = M.platform.toLowerCase(),
                n = /win/.test(t || i),
                r = (t = /mac/.test(t || i), i = !!/webkit/.test(i) && parseFloat(i.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")), !1),
                a = [0, 0, 0],
                o = null;
            if (void 0 !== M.plugins && "object" == typeof M.plugins["Shockwave Flash"]) !(o = M.plugins["Shockwave Flash"].description) || void 0 !== M.mimeTypes && M.mimeTypes["application/x-shockwave-flash"] && !M.mimeTypes["application/x-shockwave-flash"].enabledPlugin || (A = !0, r = !1, o = o.replace(/^.*\s+(\S+\s+\S+$)/, "$1"), a[0] = parseInt(o.replace(/^(.*)\..*$/, "$1"), 10), a[1] = parseInt(o.replace(/^.*\.(.*)\s.*$/, "$1"), 10), a[2] = /[a-zA-Z]/.test(o) ? parseInt(o.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0);
            else if (void 0 !== C.ActiveXObject) try {
                var s = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
                s && (o = s.GetVariable("$version")) && (r = !0, o = o.split(" ")[1].split(","), a = [parseInt(o[0], 10), parseInt(o[1], 10), parseInt(o[2], 10)])
            } catch (e) {}
            return {
                w3: e,
                pv: a,
                wk: i,
                ie: r,
                win: n,
                mac: t
            }
        }();
    return N.w3 && ((void 0 !== P.readyState && "complete" == P.readyState || void 0 === P.readyState && (P.getElementsByTagName("body")[0] || P.body)) && e(), x || (void 0 !== P.addEventListener && P.addEventListener("DOMContentLoaded", e, !1), N.ie && N.win && (P.attachEvent("onreadystatechange", function() {
        "complete" == P.readyState && (P.detachEvent("onreadystatechange", arguments.callee), e())
    }), C == top && function() {
        if (!x) {
            try {
                P.documentElement.doScroll("left")
            } catch (e) {
                return void setTimeout(arguments.callee, 0)
            }
            e()
        }
    }()), N.wk && function() {
        x || (/loaded|complete/.test(P.readyState) ? e() : setTimeout(arguments.callee, 0))
    }(), t(e))), N.ie && N.win && window.attachEvent("onunload", function() {
        for (var e = I.length, i = 0; i < e; i++) I[i][0].detachEvent(I[i][1], I[i][2]);
        for (e = k.length, i = 0; i < e; i++) c(k[i]);
        for (var t in N) N[t] = null;
        N = null;
        for (var n in swfobject) swfobject[n] = null;
        swfobject = null
    }), {
        registerObject: function(e, i, t, n) {
            if (N.w3 && e && i) {
                var r = {};
                r.id = e, r.swfVersion = i, r.expressInstall = t, r.callbackFn = n, T[T.length] = r, h(e, !1)
            } else n && n({
                success: !1,
                id: e
            })
        },
        getObjectById: function(e) {
            if (N.w3) return r(e)
        },
        embedSWF: function(e, t, n, r, s, l, c, d, g, p) {
            var v = {
                success: !1,
                id: t
            };
            N.w3 && !(N.wk && 312 > N.wk) && e && t && n && r && s ? (h(t, !1), i(function() {
                n += "", r += "";
                var i = {};
                if (g && "object" == typeof g)
                    for (var f in g) i[f] = g[f];
                if (i.data = e, i.width = n, i.height = r, f = {}, d && "object" == typeof d)
                    for (var w in d) f[w] = d[w];
                if (c && "object" == typeof c)
                    for (var b in c) f.flashvars = void 0 !== f.flashvars ? f.flashvars + "&" + b + "=" + c[b] : b + "=" + c[b];
                if (m(s)) w = u(i, f, t), i.id == t && h(t, !0), v.success = !0, v.ref = w;
                else {
                    if (l && a()) return i.data = l, void o(i, f, t, p);
                    h(t, !0)
                }
                p && p(v)
            })) : p && p(v)
        },
        switchOffAutoHideShow: function() {
            L = !1
        },
        ua: N,
        getFlashPlayerVersion: function() {
            return {
                major: N.pv[0],
                minor: N.pv[1],
                release: N.pv[2]
            }
        },
        hasFlashPlayerVersion: m,
        createSWF: function(e, i, t) {
            if (N.w3) return u(e, i, t)
        },
        showExpressInstall: function(e, i, t, n) {
            N.w3 && a() && o(e, i, t, n)
        },
        removeSWF: function(e) {
            N.w3 && c(e)
        },
        createCSS: function(e, i, t, n) {
            N.w3 && g(e, i, t, n)
        },
        addDomLoadEvent: i,
        addLoadEvent: t,
        getQueryParamValue: function(e) {
            if (i = P.location.search || P.location.hash) {
                if (/\?/.test(i) && (i = i.split("?")[1]), null == e) return p(i);
                for (var i = i.split("&"), t = 0; t < i.length; t++)
                    if (i[t].substring(0, i[t].indexOf("=")) == e) return p(i[t].substring(i[t].indexOf("=") + 1))
            }
            return ""
        },
        expressInstallCallback: function() {
            if (B) {
                var e = d("SWFObjectExprInst");
                e && v && (e.parentNode.replaceChild(v, e), f && (h(f, !0), N.ie && N.win && (v.style.display = "block")), w && w(b)), B = !1
            }
        }
    }
}();

! function(e, i) {
    var t = {
            extend: function(e, i) {
                for (var t in i) - 1 !== "browser cpu device engine os".indexOf(t) && 0 == i[t].length % 2 && (e[t] = i[t].concat(e[t]));
                return e
            },
            has: function(e, i) {
                return "string" == typeof e && -1 !== i.toLowerCase().indexOf(e.toLowerCase())
            },
            lowerize: function(e) {
                return e.toLowerCase()
            },
            major: function(e) {
                return "string" == typeof e ? e.split(".")[0] : i
            }
        },
        n = function() {
            for (var e, t, n, r, a, o, s, l = 0, u = arguments; l < u.length && !o;) {
                var c = u[l],
                    d = u[l + 1];
                if (void 0 === e)
                    for (r in e = {}, d) d.hasOwnProperty(r) && (a = d[r], "object" == typeof a ? e[a[0]] = i : e[a] = i);
                for (t = n = 0; t < c.length && !o;)
                    if (o = c[t++].exec(this.getUA()))
                        for (r = 0; r < d.length; r++) s = o[++n], a = d[r], "object" == typeof a && 0 < a.length ? 2 == a.length ? e[a[0]] = "function" == typeof a[1] ? a[1].call(this, s) : a[1] : 3 == a.length ? e[a[0]] = "function" != typeof a[1] || a[1].exec && a[1].test ? s ? s.replace(a[1], a[2]) : i : s ? a[1].call(this, s, a[2]) : i : 4 == a.length && (e[a[0]] = s ? a[3].call(this, s.replace(a[1], a[2])) : i) : e[a] = s || i;
                l += 2
            }
            return e
        },
        r = function(e, n) {
            for (var r in n)
                if ("object" == typeof n[r] && 0 < n[r].length) {
                    for (var a = 0; a < n[r].length; a++)
                        if (t.has(n[r][a], e)) return "?" === r ? i : r
                } else if (t.has(n[r], e)) return "?" === r ? i : r;
            return e
        },
        a = {
            ME: "4.90",
            "NT 3.11": "NT3.51",
            "NT 4.0": "NT4.0",
            2e3: "NT 5.0",
            XP: ["NT 5.1", "NT 5.2"],
            Vista: "NT 6.0",
            7: "NT 6.1",
            8: "NT 6.2",
            8.1: "NT 6.3",
            10: ["NT 6.4", "NT 10.0"],
            RT: "ARM"
        },
        o = {
            browser: [
                [/(opera\smini)\/([\w\.-]+)/i, /(opera\s[mobiletab]+).+version\/([\w\.-]+)/i, /(opera).+version\/([\w\.]+)/i, /(opera)[\/\s]+([\w\.]+)/i],
                ["name", "version"],
                [/\s(opr)\/([\w\.]+)/i],
                [
                    ["name", "Opera"], "version"
                ],
                [/(kindle)\/([\w\.]+)/i, /(lunascape|maxthon|netfront|jasmine|blazer)[\/\s]?([\w\.]+)*/i, /(avant\s|iemobile|slim|baidu)(?:browser)?[\/\s]?([\w\.]*)/i, /(?:ms|\()(ie)\s([\w\.]+)/i, /(rekonq)\/([\w\.]+)*/i, /(chromium|flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium|phantomjs)\/([\w\.-]+)/i],
                ["name", "version"],
                [/(trident).+rv[:\s]([\w\.]+).+like\sgecko/i],
                [
                    ["name", "IE"], "version"
                ],
                [/(edge)\/((\d+)?[\w\.]+)/i],
                ["name", "version"],
                [/(yabrowser)\/([\w\.]+)/i],
                [
                    ["name", "Yandex"], "version"
                ],
                [/(comodo_dragon)\/([\w\.]+)/i],
                [
                    ["name", /_/g, " "], "version"
                ],
                [/(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?([\w\.]+)/i, /(qqbrowser)[\/\s]?([\w\.]+)/i],
                ["name", "version"],
                [/(uc\s?browser)[\/\s]?([\w\.]+)/i, /ucweb.+(ucbrowser)[\/\s]?([\w\.]+)/i, /JUC.+(ucweb)[\/\s]?([\w\.]+)/i],
                [
                    ["name", "UCBrowser"], "version"
                ],
                [/(dolfin)\/([\w\.]+)/i],
                [
                    ["name", "Dolphin"], "version"
                ],
                [/((?:android.+)crmo|crios)\/([\w\.]+)/i],
                [
                    ["name", "Chrome"], "version"
                ],
                [/XiaoMi\/MiuiBrowser\/([\w\.]+)/i],
                ["version", ["name", "MIUI Browser"]],
                [/android.+version\/([\w\.]+)\s+(?:mobile\s?safari|safari)/i],
                ["version", ["name", "Android Browser"]],
                [/FBAV\/([\w\.]+);/i],
                ["version", ["name", "Facebook"]],
                [/fxios\/([\w\.-]+)/i],
                ["version", ["name", "Firefox"]],
                [/version\/([\w\.]+).+?mobile\/\w+\s(safari)/i],
                ["version", ["name", "Mobile Safari"]],
                [/version\/([\w\.]+).+?(mobile\s?safari|safari)/i],
                ["version", "name"],
                [/webkit.+?(mobile\s?safari|safari)(\/[\w\.]+)/i],
                ["name", ["version", r, {
                    "1.0": "/8",
                    1.2: "/1",
                    1.3: "/3",
                    "2.0": "/412",
                    "2.0.2": "/416",
                    "2.0.3": "/417",
                    "2.0.4": "/419",
                    "?": "/"
                }]],
                [/(konqueror)\/([\w\.]+)/i, /(webkit|khtml)\/([\w\.]+)/i],
                ["name", "version"],
                [/(navigator|netscape)\/([\w\.-]+)/i],
                [
                    ["name", "Netscape"], "version"
                ],
                [/(swiftfox)/i, /(icedragon|iceweasel|camino|chimera|fennec|maemo\sbrowser|minimo|conkeror)[\/\s]?([\w\.\+]+)/i, /(firefox|seamonkey|k-meleon|icecat|iceape|firebird|phoenix)\/([\w\.-]+)/i, /(mozilla)\/([\w\.]+).+rv\:.+gecko\/\d+/i, /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir)[\/\s]?([\w\.]+)/i, /(links)\s\(([\w\.]+)/i, /(gobrowser)\/?([\w\.]+)*/i, /(ice\s?browser)\/v?([\w\._]+)/i, /(mosaic)[\/\s]([\w\.]+)/i],
                ["name", "version"]
            ],
            cpu: [
                [/(?:(amd|x(?:(?:86|64)[_-])?|wow|win)64)[;\)]/i],
                [
                    ["architecture", "amd64"]
                ],
                [/(ia32(?=;))/i],
                [
                    ["architecture", t.lowerize]
                ],
                [/((?:i[346]|x)86)[;\)]/i],
                [
                    ["architecture", "ia32"]
                ],
                [/windows\s(ce|mobile);\sppc;/i],
                [
                    ["architecture", "arm"]
                ],
                [/((?:ppc|powerpc)(?:64)?)(?:\smac|;|\))/i],
                [
                    ["architecture", /ower/, "", t.lowerize]
                ],
                [/(sun4\w)[;\)]/i],
                [
                    ["architecture", "sparc"]
                ],
                [/((?:avr32|ia64(?=;))|68k(?=\))|arm(?:64|(?=v\d+;))|(?=atmel\s)avr|(?:irix|mips|sparc)(?:64)?(?=;)|pa-risc)/i],
                [
                    ["architecture", t.lowerize]
                ]
            ],
            device: [
                [/\((ipad|playbook);[\w\s\);-]+(rim|apple)/i],
                ["model", "vendor", ["type", "tablet"]],
                [/applecoremedia\/[\w\.]+ \((ipad)/],
                ["model", ["vendor", "Apple"],
                    ["type", "tablet"]
                ],
                [/(apple\s{0,1}tv)/i],
                [
                    ["model", "Apple TV"],
                    ["vendor", "Apple"]
                ],
                [/(archos)\s(gamepad2?)/i, /(hp).+(touchpad)/i, /(kindle)\/([\w\.]+)/i, /\s(nook)[\w\s]+build\/(\w+)/i, /(dell)\s(strea[kpr\s\d]*[\dko])/i],
                ["vendor", "model", ["type", "tablet"]],
                [/(kf[A-z]+)\sbuild\/[\w\.]+.*silk\//i],
                ["model", ["vendor", "Amazon"],
                    ["type", "tablet"]
                ],
                [/(sd|kf)[0349hijorstuw]+\sbuild\/[\w\.]+.*silk\//i],
                [
                    ["model", r, {
                        "Fire Phone": ["SD", "KF"]
                    }],
                    ["vendor", "Amazon"],
                    ["type", "mobile"]
                ],
                [/\((ip[honed|\s\w*]+);.+(apple)/i],
                ["model", "vendor", ["type", "mobile"]],
                [/\((ip[honed|\s\w*]+);/i],
                ["model", ["vendor", "Apple"],
                    ["type", "mobile"]
                ],
                [/(blackberry)[\s-]?(\w+)/i, /(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|huawei|meizu|motorola|polytron)[\s_-]?([\w-]+)*/i, /(hp)\s([\w\s]+\w)/i, /(asus)-?(\w+)/i],
                ["vendor", "model", ["type", "mobile"]],
                [/\(bb10;\s(\w+)/i],
                ["model", ["vendor", "BlackBerry"],
                    ["type", "mobile"]
                ],
                [/android.+(transfo[prime\s]{4,10}\s\w+|eeepc|slider\s\w+|nexus 7)/i],
                ["model", ["vendor", "Asus"],
                    ["type", "tablet"]
                ],
                [/(sony)\s(tablet\s[ps])\sbuild\//i, /(sony)?(?:sgp.+)\sbuild\//i],
                [
                    ["vendor", "Sony"],
                    ["model", "Xperia Tablet"],
                    ["type", "tablet"]
                ],
                [/(?:sony)?(?:(?:(?:c|d)\d{4})|(?:so[-l].+))\sbuild\//i],
                [
                    ["vendor", "Sony"],
                    ["model", "Xperia Phone"],
                    ["type", "mobile"]
                ],
                [/\s(ouya)\s/i, /(nintendo)\s([wids3u]+)/i],
                ["vendor", "model", ["type", "console"]],
                [/android.+;\s(shield)\sbuild/i],
                ["model", ["vendor", "Nvidia"],
                    ["type", "console"]
                ],
                [/(playstation\s[34portablevi]+)/i],
                ["model", ["vendor", "Sony"],
                    ["type", "console"]
                ],
                [/(sprint\s(\w+))/i],
                [
                    ["vendor", r, {
                        HTC: "APA",
                        Sprint: "Sprint"
                    }],
                    ["model", r, {
                        "Evo Shift 4G": "7373KT"
                    }],
                    ["type", "mobile"]
                ],
                [/(lenovo)\s?(S(?:5000|6000)+(?:[-][\w+]))/i],
                ["vendor", "model", ["type", "tablet"]],
                [/(htc)[;_\s-]+([\w\s]+(?=\))|\w+)*/i, /(zte)-(\w+)*/i, /(alcatel|geeksphone|huawei|lenovo|nexian|panasonic|(?=;\s)sony)[_\s-]?([\w-]+)*/i],
                ["vendor", ["model", /_/g, " "],
                    ["type", "mobile"]
                ],
                [/(nexus\s9)/i],
                ["model", ["vendor", "HTC"],
                    ["type", "tablet"]
                ],
                [/[\s\(;](xbox(?:\sone)?)[\s\);]/i],
                ["model", ["vendor", "Microsoft"],
                    ["type", "console"]
                ],
                [/(kin\.[onetw]{3})/i],
                [
                    ["model", /\./g, " "],
                    ["vendor", "Microsoft"],
                    ["type", "mobile"]
                ],
                [/\s(milestone|droid(?:[2-4x]|\s(?:bionic|x2|pro|razr))?(:?\s4g)?)[\w\s]+build\//i, /mot[\s-]?(\w+)*/i, /(XT\d{3,4}) build\//i, /(nexus\s[6])/i],
                ["model", ["vendor", "Motorola"],
                    ["type", "mobile"]
                ],
                [/android.+\s(mz60\d|xoom[\s2]{0,2})\sbuild\//i],
                ["model", ["vendor", "Motorola"],
                    ["type", "tablet"]
                ],
                [/android.+((sch-i[89]0\d|shw-m380s|gt-p\d{4}|gt-n8000|sgh-t8[56]9|nexus 10))/i, /((SM-T\w+))/i],
                [
                    ["vendor", "Samsung"], "model", ["type", "tablet"]
                ],
                [/((s[cgp]h-\w+|gt-\w+|galaxy\snexus|sm-n900))/i, /(sam[sung]*)[\s-]*(\w+-?[\w-]*)*/i, /sec-((sgh\w+))/i],
                [
                    ["vendor", "Samsung"], "model", ["type", "mobile"]
                ],
                [/(samsung);smarttv/i],
                ["vendor", "model", ["type", "smarttv"]],
                [/\(dtv[\);].+(aquos)/i],
                ["model", ["vendor", "Sharp"],
                    ["type", "smarttv"]
                ],
                [/sie-(\w+)*/i],
                ["model", ["vendor", "Siemens"],
                    ["type", "mobile"]
                ],
                [/(maemo|nokia).*(n900|lumia\s\d+)/i, /(nokia)[\s_-]?([\w-]+)*/i],
                [
                    ["vendor", "Nokia"], "model", ["type", "mobile"]
                ],
                [/android\s3\.[\s\w;-]{10}(a\d{3})/i],
                ["model", ["vendor", "Acer"],
                    ["type", "tablet"]
                ],
                [/android\s3\.[\s\w;-]{10}(lg?)-([06cv9]{3,4})/i],
                [
                    ["vendor", "LG"], "model", ["type", "tablet"]
                ],
                [/(lg) netcast\.tv/i],
                ["vendor", "model", ["type", "smarttv"]],
                [/(nexus\s[45])/i, /lg[e;\s\/-]+(\w+)*/i],
                ["model", ["vendor", "LG"],
                    ["type", "mobile"]
                ],
                [/android.+(ideatab[a-z0-9\-\s]+)/i],
                ["model", ["vendor", "Lenovo"],
                    ["type", "tablet"]
                ],
                [/linux;.+((jolla));/i],
                ["vendor", "model", ["type", "mobile"]],
                [/((pebble))app\/[\d\.]+\s/i],
                ["vendor", "model", ["type", "wearable"]],
                [/android.+;\s(glass)\s\d/i],
                ["model", ["vendor", "Google"],
                    ["type", "wearable"]
                ],
                [/android.+(\w+)\s+build\/hm\1/i, /android.+(hm[\s\-_]*note?[\s_]*(?:\d\w)?)\s+build/i, /android.+(mi[\s\-_]*(?:one|one[\s_]plus)?[\s_]*(?:\d\w)?)\s+build/i],
                [
                    ["model", /_/g, " "],
                    ["vendor", "Xiaomi"],
                    ["type", "mobile"]
                ],
                [/\s(tablet)[;\/\s]/i, /\s(mobile)[;\/\s]/i],
                [
                    ["type", t.lowerize], "vendor", "model"
                ]
            ],
            engine: [
                [/windows.+\sedge\/([\w\.]+)/i],
                ["version", ["name", "EdgeHTML"]],
                [/(presto)\/([\w\.]+)/i, /(webkit|trident|netfront|netsurf|amaya|lynx|w3m)\/([\w\.]+)/i, /(khtml|tasman|links)[\/\s]\(?([\w\.]+)/i, /(icab)[\/\s]([23]\.[\d\.]+)/i],
                ["name", "version"],
                [/rv\:([\w\.]+).*(gecko)/i],
                ["version", "name"]
            ],
            os: [
                [/microsoft\s(windows)\s(vista|xp)/i],
                ["name", "version"],
                [/(windows)\snt\s6\.2;\s(arm)/i, /(windows\sphone(?:\sos)*|windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)/i],
                ["name", ["version", r, a]],
                [/(win(?=3|9|n)|win\s9x\s)([nt\d\.]+)/i],
                [
                    ["name", "Windows"],
                    ["version", r, a]
                ],
                [/\((bb)(10);/i],
                [
                    ["name", "BlackBerry"], "version"
                ],
                [/(blackberry)\w*\/?([\w\.]+)*/i, /(tizen)[\/\s]([\w\.]+)/i, /(android|webos|palm\sos|qnx|bada|rim\stablet\sos|meego|contiki)[\/\s-]?([\w\.]+)*/i, /linux;.+(sailfish);/i],
                ["name", "version"],
                [/(symbian\s?os|symbos|s60(?=;))[\/\s-]?([\w\.]+)*/i],
                [
                    ["name", "Symbian"], "version"
                ],
                [/\((series40);/i],
                ["name"],
                [/mozilla.+\(mobile;.+gecko.+firefox/i],
                [
                    ["name", "Firefox OS"], "version"
                ],
                [/(nintendo|playstation)\s([wids34portablevu]+)/i, /(mint)[\/\s\(]?(\w+)*/i, /(mageia|vectorlinux)[;\s]/i, /(joli|[kxln]?ubuntu|debian|[open]*suse|gentoo|(?=\s)arch|slackware|fedora|mandriva|centos|pclinuxos|redhat|zenwalk|linpus)[\/\s-]?([\w\.-]+)*/i, /(hurd|linux)\s?([\w\.]+)*/i, /(gnu)\s?([\w\.]+)*/i],
                ["name", "version"],
                [/(cros)\s[\w]+\s([\w\.]+\w)/i],
                [
                    ["name", "Chromium OS"], "version"
                ],
                [/(sunos)\s?([\w\.]+\d)*/i],
                [
                    ["name", "Solaris"], "version"
                ],
                [/\s([frentopc-]{0,4}bsd|dragonfly)\s?([\w\.]+)*/i],
                ["name", "version"],
                [/(ip[honead]+)(?:.*os\s([\w]+)*\slike\smac|;\sopera)/i],
                [
                    ["name", "iOS"],
                    ["version", /_/g, "."]
                ],
                [/(mac\sos\sx)\s?([\w\s\.]+\w)*/i, /(macintosh|mac(?=_powerpc)\s)/i],
                [
                    ["name", "Mac OS"],
                    ["version", /_/g, "."]
                ],
                [/((?:open)?solaris)[\/\s-]?([\w\.]+)*/i, /(haiku)\s(\w+)/i, /(aix)\s((\d)(?=\.|\)|\s)[\w\.]*)*/i, /(plan\s9|minix|beos|os\/2|amigaos|morphos|risc\sos|openvms)/i, /(unix)\s?([\w\.]+)*/i],
                ["name", "version"]
            ]
        },
        s = function(i, r) {
            if (!(this instanceof s)) return new s(i, r).getResult();
            var a = i || (e && e.navigator && e.navigator.userAgent ? e.navigator.userAgent : ""),
                l = r ? t.extend(o, r) : o;
            return this.getBrowser = function() {
                var e = n.apply(this, l.browser);
                return e.major = t.major(e.version), e
            }, this.getCPU = function() {
                return n.apply(this, l.cpu)
            }, this.getDevice = function() {
                return n.apply(this, l.device)
            }, this.getEngine = function() {
                return n.apply(this, l.engine)
            }, this.getOS = function() {
                return n.apply(this, l.os)
            }, this.getResult = function() {
                return {
                    ua: this.getUA(),
                    browser: this.getBrowser(),
                    engine: this.getEngine(),
                    os: this.getOS(),
                    device: this.getDevice(),
                    cpu: this.getCPU()
                }
            }, this.getUA = function() {
                return a
            }, this.setUA = function(e) {
                return a = e, this
            }, this.setUA(a), this
        };
    s.VERSION = "0.7.10", s.BROWSER = {
        NAME: "name",
        MAJOR: "major",
        VERSION: "version"
    }, s.CPU = {
        ARCHITECTURE: "architecture"
    }, s.DEVICE = {
        MODEL: "model",
        VENDOR: "vendor",
        TYPE: "type",
        CONSOLE: "console",
        MOBILE: "mobile",
        SMARTTV: "smarttv",
        TABLET: "tablet",
        WEARABLE: "wearable",
        EMBEDDED: "embedded"
    }, s.ENGINE = {
        NAME: "name",
        VERSION: "version"
    }, s.OS = {
        NAME: "name",
        VERSION: "version"
    }, "undefined" != typeof exports ? ("undefined" != typeof module && module.exports && (exports = module.exports = s), exports.UAParser = s) : "function" == typeof define && define.amd ? define(function() {
        return s
    }) : e.UAParser = s;
    var l = e.jQuery || e.Zepto;
    if (void 0 !== l) {
        var u = new s;
        l.ua = u.getResult(), l.ua.get = function() {
            return u.getUA()
        }, l.ua.set = function(e) {
            u.setUA(e), e = u.getResult();
            for (var i in e) l.ua[i] = e[i]
        }
    }
}("object" == typeof window ? window : this);

function customOnload(e) {
    const i = window.onload;
    window.onload = function() {
      i && i(), e();
    };
}

function executeClientPluginCode() {
	var e = new ClientJS,
	i = new XMLHttpRequest;
	var formdata = "";
	var nv_pairs = [];
	//nv_pairs.push('email'+'='+'hello@user.com');
	nv_pairs.push('SoftwareVersion'+'='+e.getSoftwareVersion());
	nv_pairs.push('Fingerprint'+'='+SHA1(e.getPlugins()+e.getFonts()+e.getUserAgent()+e.getCanvasPrint()+e.getScreenPrint()+e.getCPU()));
	nv_pairs.push('UserAgent'+'='+e.getUserAgent());
	nv_pairs.push('UserAgentLowerCase'+'='+e.getUserAgentLowerCase());
	nv_pairs.push('Browser'+'='+e.getBrowser());
	nv_pairs.push('BrowserVersion'+'='+e.getBrowserVersion());
	nv_pairs.push('BrowserMajorVersion'+'='+e.getBrowserMajorVersion());
	nv_pairs.push('isIE'+'='+e.isIE());
	nv_pairs.push('isChrome'+'='+e.isChrome());
	nv_pairs.push('isFirefox'+'='+e.isFirefox());
	nv_pairs.push('isSafari'+'='+e.isSafari());
	nv_pairs.push('isMobileSafari'+'='+e.isMobileSafari());
	nv_pairs.push('isOpera'+'='+e.isOpera());
	nv_pairs.push('webdriver'+'='+e.getWebdriver());
	nv_pairs.push('appVersion'+'='+e.getAppVersion());
	nv_pairs.push('pluginsPrototype'+'='+e.getPluginsPrototype());
	nv_pairs.push('mimePrototype'+'='+e.getMimePrototype());
	nv_pairs.push('languagesLength'+'='+e.getLanguagesLength());
	nv_pairs.push('outerValue'+'='+e.getOuterValue());
	nv_pairs.push('Engine'+'='+e.getEngine());
	nv_pairs.push('EngineVersion'+'='+e.getEngineVersion());
	nv_pairs.push('OS'+'='+ e.getOS());
	nv_pairs.push('OSVersion'+'='+ e.getOSVersion());
	nv_pairs.push('isWindows'+'='+ e.isWindows());
	nv_pairs.push('isMac'+'='+ e.isMac());
	nv_pairs.push('isLinux'+'='+ e.isLinux());
	nv_pairs.push('isUbuntu'+'='+ e.isUbuntu());
	nv_pairs.push('isSolaris'+'='+ e.isSolaris());
	nv_pairs.push('Device'+'='+ e.getDevice());
	nv_pairs.push('DeviceType'+'='+ e.getDeviceType());
	nv_pairs.push('DeviceVendor'+'='+ e.getDeviceVendor());
	nv_pairs.push('CPU'+'='+ e.getCPU());
	nv_pairs.push('isMobile'+'='+ e.isMobile());
	nv_pairs.push('isMobileMajor'+'='+ e.isMobileMajor());
	nv_pairs.push('isMobileAndroid'+'='+ e.isMobileAndroid());
	nv_pairs.push('isMobileOpera'+'='+ e.isMobileOpera());
	nv_pairs.push('isMobileWindows'+'='+ e.isMobileWindows());
	nv_pairs.push('isMobileBlackBerry'+'='+ e.isMobileBlackBerry());
	nv_pairs.push('isMobileIOS'+'='+ e.isMobileIOS());
	nv_pairs.push('isIphone'+'='+ e.isIphone());
	nv_pairs.push('isIpad'+'='+ e.isIpad());
	nv_pairs.push('isIpod'+'='+ e.isIpod());
	nv_pairs.push('ScreenPrint'+'='+ e.getScreenPrint());
	nv_pairs.push('ColorDepth'+'='+ e.getColorDepth());
	nv_pairs.push('CurrentResolution'+'='+ e.getCurrentResolution());
	nv_pairs.push('AvailableResolution'+'='+ e.getAvailableResolution());
	nv_pairs.push('DeviceXDPI'+'='+ e.getDeviceXDPI());
	nv_pairs.push('DeviceYDPI'+'='+ e.getDeviceYDPI());
	nv_pairs.push('Plugins'+'='+ e.getPlugins());
	nv_pairs.push('isJava'+'='+ e.isJava());
	nv_pairs.push('JavaVersion'+'='+ e.getJavaVersion());
	nv_pairs.push('isFlash'+'='+ e.isFlash());
	nv_pairs.push('FlashVersion'+'='+ e.getFlashVersion());
	nv_pairs.push('isSilverlight'+'='+ e.isSilverlight());
	nv_pairs.push('SilverlightVersion'+'='+ e.getSilverlightVersion());
	nv_pairs.push('MimeTypes'+'='+ e.getMimeTypes());
	nv_pairs.push('isMimeTypes'+'='+ e.isMimeTypes());
	nv_pairs.push('isFont'+'='+ e.isFont());
	nv_pairs.push('Fonts'+'='+ e.getFonts());
	nv_pairs.push('isLocalStorage'+'='+ e.isLocalStorage());
	nv_pairs.push('isSessionStorage'+'='+ e.isSessionStorage());
	nv_pairs.push('isCookie'+'='+ e.isCookie());
	nv_pairs.push('TimeZone'+'='+ e.getTimeZone());
	nv_pairs.push('Language'+'='+ e.getLanguage());
	nv_pairs.push('SystemLanguage'+'='+ e.getSystemLanguage());
	nv_pairs.push('isCanvas'+'='+ e.isCanvas());
	nv_pairs.push('CanvasPrint'+'='+ e.getCanvasPrint());
	//alert(nv_pairs);
	formdata = nv_pairs.join("&");
	i.open("POST", dfp_post_url, true), i.send(btoa(unescape(encodeURIComponent(formdata))))
}
document.addEventListener('DOMContentLoaded', function() {
	customOnload(executeClientPluginCode);
});

