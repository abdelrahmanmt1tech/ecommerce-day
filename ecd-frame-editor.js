/**
 * ECommerce Day attending-frame editor (Facebook-style photo frame).
 * Frame asset: transparent hole at (218,450) 640×554 on 1080×1350 canvas.
 *
 * Usage (HTML):
 *   EcdFrameEditor.mount({
 *     root: el,
 *     frameSrc: "assets/attendee-frame.png",
 *     existingUrl: data.attendeeFrameUrl || "",
 *     onConfirm: async (dataUrl) => { await EcdApi.uploadAttendeeFrame(...) }
 *   });
 *
 * Usage (React): import helpers via window.EcdFrameEditor or shared component.
 */
(function (global) {
  "use strict";

  var FRAME_W = 1080;
  var FRAME_H = 1350;
  var HOLE = { x: 218, y: 450, w: 640, h: 554, r: 48 };
  var DOWNLOAD_NAME = "ecommerce-day-2026-attending";

  // Same brand glyphs as the site footer (footer.js).
  var SHARE_NETWORKS = [
    { key: "facebook", label: "Facebook", icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
    { key: "linkedin", label: "LinkedIn", icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
    { key: "x", label: "X", icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
  ];

  // Where the fallback sends people when the device cannot share files.
  // Facebook does not accept pre-filled post text, so it opens the feed.
  function networkComposeUrl(key, text) {
    if (key === "x") return "https://x.com/intent/post?text=" + encodeURIComponent(text);
    if (key === "linkedin") {
      return "https://www.linkedin.com/feed/?shareActive=true&text=" + encodeURIComponent(text);
    }
    return "https://www.facebook.com/";
  }

  function shareButtonsHtml() {
    return SHARE_NETWORKS.map(function (n) {
      return (
        '<button type="button" class="ecd-frame-share-btn" data-net="' + n.key + '" aria-label="Share on ' + n.label + '">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="' + n.icon + '"/></svg>' +
        "<span>" + n.label + "</span></button>"
      );
    }).join("");
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = function () {
        resolve(img);
      };
      img.onerror = function () {
        reject(new Error("Could not load image"));
      };
      img.src = src;
    });
  }

  function coverScale(imgW, imgH, holeW, holeH) {
    return Math.max(holeW / imgW, holeH / imgH);
  }

  /**
   * Draw photo (cover + pan/zoom) then frame overlay into canvas.
   * state: { img, scale, ox, oy } where ox/oy are photo center offsets in hole space.
   */
  function renderComposite(canvas, frameImg, state) {
    var ctx = canvas.getContext("2d");
    canvas.width = FRAME_W;
    canvas.height = FRAME_H;
    ctx.clearRect(0, 0, FRAME_W, FRAME_H);

    if (state && state.img) {
      var base = coverScale(state.img.width, state.img.height, HOLE.w, HOLE.h);
      var scale = base * (state.scale || 1);
      var drawW = state.img.width * scale;
      var drawH = state.img.height * scale;
      var cx = HOLE.x + HOLE.w / 2 + (state.ox || 0);
      var cy = HOLE.y + HOLE.h / 2 + (state.oy || 0);

      ctx.save();
      roundRectPath(ctx, HOLE.x, HOLE.y, HOLE.w, HOLE.h, HOLE.r);
      ctx.clip();
      ctx.drawImage(state.img, cx - drawW / 2, cy - drawH / 2, drawW, drawH);
      ctx.restore();
    }

    if (frameImg) {
      ctx.drawImage(frameImg, 0, 0, FRAME_W, FRAME_H);
    }

    if (state && state.name) {
      drawName(ctx, state.name);
    }
  }

  // Attendee name under the photo window. Same centre line as the title and
  // date (x 540), same 30px padding the design uses above the window, never
  // wider than the window, and kept clear of the card's bottom edge (y 1173).
  var NAME = {
    cx: 540,
    top: HOLE.y + HOLE.h + 1 + 30, // first row under the window is 1005
    maxW: HOLE.w,
    maxBottom: 1173 - 30,
    size: 52,
    minSingle: 40, // below this, 2 lines read better than one small line
    minSize: 34,
    wrapSize: 44,
    floorSize: 20,
    lineHeight: 1.18,
    color: "#FFFFFF",
  };
  var ARABIC_RE = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

  function nameFont(size, arabic) {
    return arabic
      ? "700 " + size + 'px "IBM Plex Sans Arabic", Manrope, sans-serif'
      : "800 " + size + 'px Manrope, "IBM Plex Sans Arabic", sans-serif';
  }

  function cleanName(name) {
    return String(name || "").replace(/\s+/g, " ").trim();
  }

  // Best 2-line split: the space that keeps the longer line shortest.
  function splitTwoLines(ctx, words) {
    var best = null;
    for (var i = 1; i < words.length; i++) {
      var a = words.slice(0, i).join(" ");
      var b = words.slice(i).join(" ");
      var w = Math.max(ctx.measureText(a).width, ctx.measureText(b).width);
      if (!best || w < best.w) best = { lines: [a, b], w: w };
    }
    return best;
  }

  function layoutName(ctx, name) {
    var arabic = ARABIC_RE.test(name);
    var words = name.split(" ");
    function fits(lines, size) {
      ctx.font = nameFont(size, arabic);
      // Height of the tallest letter actually in the first line, so the
      // visible gap under the photo is identical for every name.
      var capH = ctx.measureText(lines[0]).actualBoundingBoxAscent || size * 0.72;
      var widest = 0;
      var descent = 0;
      lines.forEach(function (l) {
        var m = ctx.measureText(l);
        widest = Math.max(widest, m.width);
        descent = Math.max(descent, m.actualBoundingBoxDescent || 0);
      });
      var bottom = NAME.top + capH + (lines.length - 1) * size * NAME.lineHeight + descent;
      return widest <= NAME.maxW && bottom <= NAME.maxBottom ? { capH: capH } : null;
    }
    var size, ok;
    // 1) One line, shrinking from the full size.
    for (size = NAME.size; size >= NAME.minSingle; size -= 2) {
      ok = fits([name], size);
      if (ok) return { lines: [name], size: size, capH: ok.capH, arabic: arabic };
    }
    // 2) Two balanced lines at a space.
    if (words.length > 1) {
      for (size = NAME.wrapSize; size >= NAME.minSize; size -= 2) {
        ctx.font = nameFont(size, arabic);
        var split = splitTwoLines(ctx, words);
        ok = fits(split.lines, size);
        if (ok) return { lines: split.lines, size: size, capH: ok.capH, arabic: arabic };
      }
    }
    // 3) Single word, or still too long: keep shrinking until it fits.
    var lines = words.length > 1 ? null : [name];
    for (size = words.length > 1 ? NAME.minSize - 2 : NAME.minSingle - 2; size >= NAME.floorSize; size -= 2) {
      ctx.font = nameFont(size, arabic);
      var candidate = lines || splitTwoLines(ctx, words).lines;
      ok = fits(candidate, size);
      if (ok) return { lines: candidate, size: size, capH: ok.capH, arabic: arabic };
    }
    ctx.font = nameFont(NAME.floorSize, arabic);
    return {
      lines: lines || splitTwoLines(ctx, words).lines,
      size: NAME.floorSize,
      capH: NAME.floorSize * 0.72,
      arabic: arabic,
    };
  }

  function drawName(ctx, rawName) {
    var name = cleanName(rawName);
    if (!name) return;
    ctx.save();
    var layout = layoutName(ctx, name);
    ctx.font = nameFont(layout.size, layout.arabic);
    ctx.fillStyle = NAME.color;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    if ("direction" in ctx) ctx.direction = layout.arabic ? "rtl" : "ltr";
    // Top of the tallest letter sits exactly NAME.top.
    var baseline = NAME.top + layout.capH;
    layout.lines.forEach(function (line, i) {
      var w = ctx.measureText(line).width;
      if (w > NAME.maxW) {
        ctx.fillText(line, NAME.cx, baseline + i * layout.size * NAME.lineHeight, NAME.maxW);
      } else {
        ctx.fillText(line, NAME.cx, baseline + i * layout.size * NAME.lineHeight);
      }
    });
    ctx.restore();
  }

  function roundRectPath(ctx, x, y, w, h, r) {
    var rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function mount(opts) {
    var root = opts.root;
    if (!root) throw new Error("EcdFrameEditor.mount: root required");
    var frameSrc = opts.frameSrc || "assets/attendee-frame.png";
    var onConfirm = opts.onConfirm || function () {};
    var existingUrl = opts.existingUrl || "";
    var share = opts.share && opts.share.text ? opts.share : null;

    root.innerHTML =
      '<div class="ecd-frame-editor">' +
      '<div class="ecd-frame-preview-wrap">' +
      '<canvas class="ecd-frame-canvas" aria-label="Attending photo preview"></canvas>' +
      "</div>" +
      '<div class="ecd-frame-controls">' +
      '<label class="ecd-frame-upload-btn">' +
      '<input type="file" accept="image/jpeg,image/png,image/webp" class="ecd-frame-file" hidden />' +
      "Choose photo" +
      "</label>" +
      '<label class="ecd-frame-zoom-label">Zoom' +
      '<input type="range" class="ecd-frame-zoom" min="100" max="250" value="100" disabled />' +
      "</label>" +
      '<p class="ecd-frame-hint">Drag the photo to position it inside the frame.</p>' +
      '<div class="ecd-frame-actions">' +
      '<button type="button" class="ecd-frame-confirm" disabled>Confirm &amp; save</button>' +
      '<a class="ecd-frame-download" style="display:none" download="' + DOWNLOAD_NAME + '.jpg">Download</a>' +
      "</div>" +
      (share
        ? '<div class="ecd-frame-share" hidden>' +
          '<p class="ecd-frame-share-label">Share your photo</p>' +
          '<div class="ecd-frame-share-btns">' + shareButtonsHtml() + "</div>" +
          "</div>"
        : "") +
      '<p class="ecd-frame-status" aria-live="polite"></p>' +
      "</div>" +
      "</div>";

    var canvas = root.querySelector(".ecd-frame-canvas");
    var fileInput = root.querySelector(".ecd-frame-file");
    var zoom = root.querySelector(".ecd-frame-zoom");
    var confirmBtn = root.querySelector(".ecd-frame-confirm");
    var downloadLink = root.querySelector(".ecd-frame-download");
    var statusEl = root.querySelector(".ecd-frame-status");
    var shareRow = root.querySelector(".ecd-frame-share");

    var frameImg = null;
    var state = { img: null, scale: 1, ox: 0, oy: 0, name: cleanName(opts.name) };
    var dragging = false;
    var lastX = 0;
    var lastY = 0;

    function setStatus(msg, isError) {
      statusEl.textContent = msg || "";
      statusEl.style.color = isError ? "#b3362e" : "#6b747e";
    }

    function redraw() {
      renderComposite(canvas, frameImg, state);
      // Display size
      canvas.style.width = "100%";
      canvas.style.maxWidth = "360px";
      canvas.style.height = "auto";
      canvas.style.touchAction = "none";
      canvas.style.cursor = state.img ? "grab" : "default";
    }

    function syncDownload(url) {
      if (url) {
        downloadLink.href = url;
        downloadLink.style.display = "";
        // Browsers ignore `download` on cross-origin URLs (e.g. the CDN copy),
        // so open those in a new tab instead of leaving the confirmation page.
        if (/^(blob|data):/.test(url)) {
          downloadLink.removeAttribute("target");
          downloadLink.removeAttribute("rel");
        } else {
          downloadLink.setAttribute("target", "_blank");
          downloadLink.setAttribute("rel", "noopener");
        }
      } else {
        downloadLink.style.display = "none";
      }
    }

    // Local copy of the composite, so Download works even if the server save fails.
    // shareFile is prepared here, before any click: browsers only allow the share
    // menu, pop-ups and clipboard during the click itself, so nothing may wait then.
    var localUrl = "";
    var shareFile = null;
    function useLocalImage(url, blob) {
      if (localUrl && localUrl.indexOf("blob:") === 0 && global.URL && URL.revokeObjectURL) {
        URL.revokeObjectURL(localUrl);
      }
      localUrl = url;
      var ext = blob && blob.type === "image/png" ? "png" : "jpg";
      downloadLink.setAttribute("download", DOWNLOAD_NAME + "." + ext);
      shareFile = null;
      if (blob && typeof global.File === "function") {
        try {
          shareFile = new File([blob], DOWNLOAD_NAME + "." + ext, { type: blob.type || "image/jpeg" });
        } catch (e) {
          shareFile = null;
        }
      }
      syncDownload(localUrl);
      if (shareRow) shareRow.hidden = false;
    }
    function setLocalDownload(dataUrl) {
      return new Promise(function (resolve) {
        if (canvas.toBlob && global.URL && URL.createObjectURL) {
          canvas.toBlob(
            function (blob) {
              if (blob) useLocalImage(URL.createObjectURL(blob), blob);
              else useLocalImage(dataUrl, null);
              resolve();
            },
            "image/jpeg",
            0.88,
          );
        } else {
          useLocalImage(dataUrl, null);
          resolve();
        }
      });
    }

    // Returning visitor: load the saved copy so Download and Share use a real
    // file. If the CDN cannot be read, keep the plain link (opens in a new tab).
    function loadExistingCopy() {
      if (!existingUrl || !global.fetch || !(global.URL && URL.createObjectURL)) return;
      fetch(existingUrl, { mode: "cors", credentials: "omit" })
        .then(function (res) {
          return res.ok ? res.blob() : null;
        })
        .then(function (blob) {
          // Skip if a new photo was confirmed while this was loading.
          if (!blob || localUrl || !/^image\//.test(blob.type)) return;
          useLocalImage(URL.createObjectURL(blob), blob);
        })
        .catch(function () {});
    }

    // The name is drawn on the canvas, so its font must be loaded first or the
    // browser would silently draw it in a fallback font.
    function loadNameFont() {
      if (!state.name || !document.fonts || !document.fonts.load) return Promise.resolve();
      var arabic = ARABIC_RE.test(state.name);
      return document.fonts.load(nameFont(NAME.size, arabic), state.name).catch(function () {});
    }

    Promise.all([loadImage(frameSrc), loadNameFont()])
      .then(function (loaded) {
        var img = loaded[0];
        frameImg = img;
        redraw();
        if (existingUrl) {
          syncDownload(existingUrl);
          setStatus("You already have an attending photo. Upload a new one to replace it.");
          loadExistingCopy();
        }
      })
      .catch(function () {
        setStatus("Could not load frame template.", true);
      });

    fileInput.addEventListener("change", function () {
      var file = fileInput.files && fileInput.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        loadImage(String(reader.result))
          .then(function (img) {
            state.img = img;
            state.scale = 1;
            state.ox = 0;
            state.oy = 0;
            zoom.value = "100";
            zoom.disabled = false;
            confirmBtn.disabled = false;
            setStatus("Adjust zoom and drag to fit, then confirm.");
            redraw();
          })
          .catch(function () {
            setStatus("Could not read that photo.", true);
          });
      };
      reader.readAsDataURL(file);
    });

    zoom.addEventListener("input", function () {
      state.scale = Number(zoom.value) / 100;
      redraw();
    });

    function pointerDown(e) {
      if (!state.img) return;
      dragging = true;
      canvas.style.cursor = "grabbing";
      var pt = e.touches ? e.touches[0] : e;
      lastX = pt.clientX;
      lastY = pt.clientY;
      e.preventDefault();
    }
    function pointerMove(e) {
      if (!dragging || !state.img) return;
      var pt = e.touches ? e.touches[0] : e;
      var rect = canvas.getBoundingClientRect();
      var scaleX = FRAME_W / rect.width;
      var scaleY = FRAME_H / rect.height;
      state.ox += (pt.clientX - lastX) * scaleX;
      state.oy += (pt.clientY - lastY) * scaleY;
      // Soft clamp so photo still covers the hole
      var base = coverScale(state.img.width, state.img.height, HOLE.w, HOLE.h) * state.scale;
      var drawW = state.img.width * base;
      var drawH = state.img.height * base;
      var maxOx = Math.max(0, (drawW - HOLE.w) / 2);
      var maxOy = Math.max(0, (drawH - HOLE.h) / 2);
      state.ox = clamp(state.ox, -maxOx, maxOx);
      state.oy = clamp(state.oy, -maxOy, maxOy);
      lastX = pt.clientX;
      lastY = pt.clientY;
      redraw();
      e.preventDefault();
    }
    function pointerUp() {
      dragging = false;
      if (state.img) canvas.style.cursor = "grab";
    }

    canvas.addEventListener("mousedown", pointerDown);
    window.addEventListener("mousemove", pointerMove);
    window.addEventListener("mouseup", pointerUp);
    canvas.addEventListener("touchstart", pointerDown, { passive: false });
    canvas.addEventListener("touchmove", pointerMove, { passive: false });
    canvas.addEventListener("touchend", pointerUp);

    confirmBtn.addEventListener("click", function () {
      if (!state.img || confirmBtn.disabled) return;
      confirmBtn.disabled = true;
      setStatus("Saving…");
      redraw();
      var dataUrl = canvas.toDataURL("image/jpeg", 0.88);
      // The photo is built in the browser, so Download never waits on the
      // server. Saving a copy is best effort and must not block the attendee.
      setLocalDownload(dataUrl)
        .then(function () {
          return Promise.resolve()
            .then(function () {
              return onConfirm(dataUrl);
            })
            .then(function () {
              setStatus("Saved. You can download your attending photo below.");
            })
            .catch(function (err) {
              if (global.console && console.warn) {
                console.warn("[ecd-frame] server save failed", err);
              }
              setStatus("Your attending photo is ready. Download it below.");
            });
        })
        .then(function () {
          confirmBtn.disabled = false;
          confirmBtn.textContent = "Update photo";
        });
    });

    function shareCaption() {
      return share.text + (share.url ? "\n" + share.url : "");
    }

    // Starts right away, while the page still has focus. Resolves true/false.
    function copyCaption(text) {
      try {
        if (global.navigator && navigator.clipboard && navigator.clipboard.writeText) {
          return navigator.clipboard.writeText(text).then(
            function () {
              return true;
            },
            function () {
              return false;
            },
          );
        }
      } catch (e) {}
      return Promise.resolve(false);
    }

    function saveLocalCopy() {
      var a = document.createElement("a");
      a.href = localUrl;
      a.download = downloadLink.getAttribute("download") || DOWNLOAD_NAME + ".jpg";
      a.style.display = "none";
      root.appendChild(a);
      a.click();
      root.removeChild(a);
    }

    // No file sharing on this device: save the photo, copy the caption and
    // open the network so the attendee can attach the photo to a new post.
    function shareFallback(net, label, copied) {
      saveLocalCopy();
      var popup = null;
      try {
        popup = global.open(networkComposeUrl(net, shareCaption()), "_blank");
        if (popup) popup.opener = null;
      } catch (e) {
        popup = null;
      }
      copied.then(function (ok) {
        var msg = ok
          ? "Photo saved and caption copied. Add the photo to your " + label + " post and paste the caption."
          : "Photo saved. Add it to your " + label + " post.";
        if (!popup) msg += " Open " + label + " to post it.";
        setStatus(msg);
      });
    }

    function onShareClick(net, label) {
      if (!localUrl) return;
      var text = shareCaption();
      var copied = copyCaption(text);
      var nav = global.navigator;
      var canShareFile = false;
      try {
        canShareFile = !!(
          shareFile && nav && nav.share && nav.canShare && nav.canShare({ files: [shareFile] })
        );
      } catch (e) {
        canShareFile = false;
      }
      if (!canShareFile) {
        shareFallback(net, label, copied);
        return;
      }
      // The device share menu carries the real photo; the attendee picks the app there.
      nav.share({ files: [shareFile], text: text }).then(
        function () {
          copied.then(function (ok) {
            setStatus(
              ok
                ? "Shared. The caption is copied too, paste it if the app leaves it out."
                : "Shared.",
            );
          });
        },
        function (err) {
          if (err && err.name === "AbortError") return; // closed the menu
          shareFallback(net, label, copied);
        },
      );
    }

    if (shareRow) {
      SHARE_NETWORKS.forEach(function (n) {
        var btn = shareRow.querySelector('[data-net="' + n.key + '"]');
        if (btn) {
          btn.addEventListener("click", function () {
            onShareClick(n.key, n.label);
          });
        }
      });
    }

    return {
      destroy: function () {
        window.removeEventListener("mousemove", pointerMove);
        window.removeEventListener("mouseup", pointerUp);
        if (localUrl && localUrl.indexOf("blob:") === 0 && global.URL && URL.revokeObjectURL) {
          URL.revokeObjectURL(localUrl);
        }
        root.innerHTML = "";
      },
      getDataUrl: function () {
        redraw();
        return canvas.toDataURL("image/png");
      },
      HOLE: HOLE,
      FRAME_W: FRAME_W,
      FRAME_H: FRAME_H,
    };
  }

  global.EcdFrameEditor = {
    mount: mount,
    renderComposite: renderComposite,
    loadImage: loadImage,
    HOLE: HOLE,
    FRAME_W: FRAME_W,
    FRAME_H: FRAME_H,
  };
})(typeof window !== "undefined" ? window : globalThis);
