ISLAND READERS: ng sample (Island 3, Stop 1)
A playable web-app sample. Static HTML/CSS/JS, no backend, no accounts, nothing sent anywhere.
Progress (stars, streak, stickers, badge, check score) is saved in this browser's localStorage.

HOW TO TRY IT
1) Easiest: unzip, then double-click index.html. It runs from your computer.
   (Opening from a file works, but the "install" and offline features need a web address, see 2 and 3.)
2) Local web address (also gives the offline/installable version):
      cd app_sample
      python3 -m http.server 8000
   then open http://localhost:8000 in Chrome or Edge. Use the browser menu: Install app / Add to Home Screen.
3) Free hosting later (not done yet): upload this folder to a GitHub Pages repo (or Netlify Drop / Cloudflare Pages).
   It works from a sub-folder URL, because every path is relative. Needs https for install and offline.

GROWN-UP CORNER: press and hold the gear button for about 1 second. There you can reset progress,
turn on calm motion, open every lesson for testing, and play the isolated ng sound.

CREDITS: Andika font (SIL Open Font License 1.1). Zip, Frill, comic panels and the Sanshin Isle art are original Island Readers art.
Voices: recorded with edge-tts (generated voices).
