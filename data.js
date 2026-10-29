/* SilverArch / SilverNebula site data.
   Everything here is taken from the real projects and their READMEs/PKGBUILDs.
   Edit this file to change content; no HTML changes needed. */
window.SA_DATA = {
  repos: [
    { name: "silverpurge", lang: "Nim", tag: "System cleanup", commits: 5, updated: "2026-10-26",
      url: "https://github.com/s1lverarch/silverpurge",
      desc: { en: "Cleans orphan packages, the pacman package cache, systemd journal logs, trash and thumbnails. Dry-run by default.",
              ar: "ينظف الحزم اليتيمة وكاش pacman وسجلات journal والمهملات والصور المصغّرة. وضع المعاينة هو الافتراضي.",
              fr: "Nettoie les paquets orphelins, le cache pacman, les journaux systemd, la corbeille et les miniatures. Simulation par défaut.",
              ru: "Очищает сиротские пакеты, кэш pacman, журналы systemd, корзину и миниатюры. По умолчанию — предпросмотр." } },
    { name: "silverflux", lang: "Lua", tag: "Sync", commits: 4, updated: "2026-10-26",
      url: "https://github.com/s1lverarch/silverflux",
      desc: { en: "One command for mirror ranking, pacman upgrade, AUR upgrade and cleanup of old package versions.",
              ar: "أمر واحد لترتيب المرايات وتحديث pacman وAUR وتنظيف النسخ القديمة.",
              fr: "Une seule commande pour classer les miroirs, mettre à jour pacman et l'AUR et nettoyer les anciennes versions.",
              ru: "Одна команда для выбора зеркал, обновления pacman и AUR и очистки старых версий пакетов." } },
    { name: "silvergrab", lang: "Go", tag: "Package manager", commits: 6, updated: "2026-10-25",
      url: "https://github.com/s1lverarch/silvergrab",
      desc: { en: "A pacman wrapper with a paru-style interface for installing, removing and searching packages.",
              ar: "غلاف لـ pacman بواجهة شبيهة بـ paru للتثبيت والحذف والبحث.",
              fr: "Une surcouche de pacman à l'interface type paru pour installer, supprimer et chercher des paquets.",
              ru: "Обёртка над pacman в стиле paru для установки, удаления и поиска пакетов." } },
    { name: "SilverSaphire", lang: "Go + Nim", tag: "Installer", commits: 20, updated: "2026-10-17",
      url: "https://github.com/s1lverarch/SilverSaphire",
      desc: { en: "The SilverArch installer (binary: silverss). Guided terminal UI with themes, timezone entry and a full install flow.",
              ar: "مثبّت SilverArch (الملف التنفيذي: silverss). واجهة طرفية موجّهة مع سمات وإدخال المنطقة الزمنية وتدفق تثبيت كامل.",
              fr: "L'installateur SilverArch (binaire : silverss). TUI guidée avec thèmes, fuseau horaire et installation complète.",
              ru: "Установщик SilverArch (бинарник: silverss). Пошаговый TUI с темами, часовым поясом и полной установкой." } },
    { name: "silvernebula", lang: "Arch ISO", tag: "Build hub + repo", commits: 4, updated: "stable",
      url: "https://github.com/s1lverarch/silvernebula",
      desc: { en: "The distribution build hub: ISO profiles, installers and the signed pacman repository (x86_64).",
              ar: "مركز بناء التوزيعة: ملفات ISO والمثبتات والمستودع الموقّع لـ pacman (x86_64).",
              fr: "Le centre de build : profils ISO, installateurs et dépôt pacman signé (x86_64).",
              ru: "Центр сборки: профили ISO, установщики и подписанный репозиторий pacman (x86_64)." } },
    { name: "slite", lang: "Rootless", tag: "Container engine", commits: null, updated: "v1.9.4",
      url: "https://github.com/s1lverarch/slite",
      desc: { en: "Rootless, proot-based container engine for running packages from many distributions without a daemon or sudo.",
              ar: "محرك حاويات بدون root مبني على proot لتشغيل الحزم من توزيعات متعددة بدون daemon أو sudo.",
              fr: "Moteur de conteneurs sans root basé sur proot, sans démon ni sudo.",
              ru: "Контейнерный движок без root на базе proot: без демона и sudo." } }
  ],

  /* Command reference: only commands that exist in the code. */
  docs: [
    { id: "silverpurge", title: "silverpurge", sub: "scan and clean",
      blocks: [
        { cmd: "silverpurge", note: "dry-run scan of every category (the default; deletes nothing)" },
        { cmd: "silverpurge scan trash thumbnails", note: "scan only selected categories" },
        { cmd: "sudo silverpurge clean all", note: "clean every category, asking before each step" },
        { cmd: "silverpurge --version", note: "print version" }
      ],
      facts: [
        "Categories: orphans, cache, logs, trash, thumbnails, all.",
        "orphans, cache and logs need root; silverpurge re-runs itself with sudo when needed.",
        "trash and thumbnails ask: backup (b) or delete permanently (d).",
        "Backups go to ~/.local/share/silverpurge/backup/<timestamp>/.",
        "Actions are logged to /var/log/silverpurge.log."
      ] },
    { id: "silverflux", title: "silverflux", sub: "sync, mirrors, AUR",
      blocks: [
        { cmd: "sudo silverflux", note: "full sync: mirrors, pacman -Syu, AUR, cleanup of old versions" },
        { cmd: "sudo silverflux mirrors", note: "rank mirrors only" },
        { cmd: "sudo silverflux aur", note: "update AUR packages only" },
        { cmd: "silverflux status", note: "count pending updates" },
        { cmd: "sudo silverflux -Syu", note: "alias of the full sync" }
      ],
      facts: [
        "Config file: ~/.config/silverflux/config.lua (see config.example.lua).",
        "Keys: aur_helper (auto|paru|yay|none), mirror_method (reflector|rate-mirrors|none), mirror_count, keep_versions, notify, hooks.",
        "Hooks: ~/.config/silverflux/hooks/pre-sync.sh and post-sync.sh (must be executable).",
        "AUR helpers never run as root; silverflux runs them as the invoking user (SUDO_USER).",
        "If reflector fails, the previous mirrorlist is restored from its .bak copy."
      ] },
    { id: "silvergrab", title: "silvergrab", sub: "pacman wrapper",
      blocks: [
        { cmd: "sudo silvergrab -S firefox", note: "install (asks to continue)" },
        { cmd: "sudo silvergrab -R vim", note: "remove (asks whether to keep config files)" },
        { cmd: "silvergrab -Ss neovim", note: "search repositories" },
        { cmd: "sudo silvergrab -Syu", note: "sync and upgrade the system" },
        { cmd: "silvergrab --help", note: "usage" }
      ],
      facts: [
        "-S, -R and -Syu require root and exit with a message if run without it.",
        "Each action shows the list first and waits for confirmation."
      ] },
    { id: "silverss", title: "silverss", sub: "SilverArch installer",
      blocks: [
        { cmd: "sudo silverss", note: "start the installer (renamed from ss to avoid a clash with iproute2's ss)" }
      ],
      facts: [
        "Steps in order: Theme, Language, Keyboard, Timezone, Disk, Filesystem, Bootloader, Kernel, Network, User, Hostname, Desktop, Fonts, AUR, Security, Swap, GPU, Flatpak, SSH, Dotfiles, Review & Install.",
        "Timezone: pick from the list, or choose Custom and type Region/City (for example Africa/Algiers).",
        "Keys: ↑ ↓ move, enter select, b back, s or tab skip a skippable step, esc cancel text input, q quit.",
        "Optional steps (Fonts, Security, Flatpak, SSH, Dotfiles) can be skipped."
      ] },
    { id: "repo", title: "silvernebula repo", sub: "add to pacman (signed)",
      blocks: [
        { cmd: "curl -fLO https://s1lverarch.github.io/linuxdistro/keys/silvernebula.gpg\ngpg --show-keys --with-fingerprint silvernebula.gpg", note: "step 1: download the public key and check the fingerprint (8EA07B2205012BA364DBB14BCC892E251DCD1C44)" },
        { cmd: "sudo pacman-key --add silvernebula.gpg\nsudo pacman-key --lsign-key 8EA07B2205012BA364DBB14BCC892E251DCD1C44", note: "step 2: import the key into pacman and mark it trusted" },
        { cmd: "[silvernebula]\nSigLevel = Required DatabaseOptional\nServer   = https://raw.githubusercontent.com/s1lverarch/silvernebula/main/$arch", note: "step 3: add the repository with signature checks on" },
        { cmd: "sudo pacman -Syu\nsudo pacman -S silvernebula-keyring", note: "step 4: sync, then install the keyring package" }
      ],
      facts: [
        "Never disable signature checks (SigLevel = Optional TrustAll) on a real system.",
        "Packages in x86_64/: silvernebula-keyring, silversaphire, slite, silvergrab, silverflux, silverpurge.",
        "The database is silvernebula.db, a real file (not a symlink) so GitHub serves it correctly.",
        "Packagers: build-repo.sh builds, signs and indexes every package (set SN_KEY to the master fingerprint)."
      ] }
  ],

  iso: {
    version: "v2026.06.22", arch: "x86_64", size: "1.1 GB", boot: "UEFI & Legacy",
    sha256: "e03e748a145c65a43b21eaddf07be2e9520dc2ad89cbfa6243f203b756526bb7",
    url: "https://github.com/s1lverarch/silvernebula/releases"
  },

  /* Distros the Slite engine targets (as listed by the project). */
  distros: ["Arch","NixOS","Gentoo","Void","Solus","Slackware","Alpine","Mageia","Clear","TinyCore","LFS","Debian","Ubuntu","Kali","PopOS","Lubuntu","Fedora","CentOS","AlmaLinux","Rocky","Rawhide","Guix","FreeBSD","OpenBSD","Devuan","AntiX","Mint","Zorin","Elementary","Deepin","Nitrux","PureOS","Tails","BlueOS","Linpus","Pardus","ReactOS","Haiku","ROS","VoidGL","Puppy","System","Artix","Endeavour","Garuda","CachyOS","Termux","ArchARM","VoidMobile"],

  /* Phoronix headlines shown when the live feed cannot be reached (copied from the saved page). */
  news: {
    snapshot: "Snapshot of the Phoronix feed",
    items: [
      { title: "AMD's ROCm HRX Loom v0.1 Released For Targeting AMD CPUs, GPUs & NPUs",
        link: "https://www.phoronix.com/news/AMD-ROCm-HRX-Loom-0.1", category: "AMD", time: "80 minutes ago",
        excerpt: "Loom SDK v0.1 was released as part of the latest ROCm advancements announced at AMD Advancing AI." },
      { title: "FAT32 File-System Seeing As Much As 265x Improvement With Linux 7.4",
        link: "https://www.phoronix.com/news/Linux-7.4-Faster-FAT32", category: "Linux Storage", time: "96 minutes ago",
        excerpt: "A change merged for Linux 7.4 is showing large speed-ups for the FAT32 file-system." },
      { title: "Graphics/NPU Driver Changes Already Begin Queuing Up For What Will Be Linux 7.5",
        link: "https://www.phoronix.com/news/Linux-7.5-drm-misc-next", category: "Linux Kernel", time: "113 minutes ago",
        excerpt: "drm-misc-next pull requests have been sent to DRM-Next to stage new feature code for Linux 7.5." },
      { title: "KSMBD Adds New Options With Linux 7.4",
        link: "https://www.phoronix.com/news/Linux-7.4-KSMBD", category: "Linux Storage", time: "2 hours ago",
        excerpt: "Several improvements to KSMBD, the in-kernel SMB3 file server, were merged for Linux 7.4." }
    ]
  },

  links: {
    discord: "https://discord.gg/eBgVHSPru9",
    github: "https://github.com/s1lverarch",
    wiki: "https://silverarchlinux.miraheze.org/wiki/",
    email: "s1lv3rcore@proton.me",
    site: "https://s1lverarch.github.io/linuxdistro/",
    unrwa: "https://www.unrwa.org",
    phoronix: "https://www.phoronix.com/rss.php"
  }
};
