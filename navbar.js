(function () {
    // Deteksi halaman aktif berdasarkan nama file URL
    const path = window.location.pathname.split('/').pop() || 'index.html';

    const navLinks = [
        { href: 'index.html',          label: 'Beranda',       icon: 'fa-home' },
        { href: 'katalog_produk.html', label: 'Katalog',       icon: 'fa-th-large' },
        { href: 'tentang.html',        label: 'Tentang Kami',  icon: 'fa-info-circle' },
        { href: 'kontak.html',         label: 'Kontak',        icon: 'fa-envelope' },
    ];

    const linksHTML = navLinks.map(link => {
        const isActive = path === link.href || (path === '' && link.href === 'index.html');
        return `
            <a href="${link.href}" class="nav-item ${isActive ? 'nav-item-active' : 'nav-item-inactive'}">
                <i class="fas ${link.icon} nav-item-icon"></i>
                <span>${link.label}</span>
            </a>
        `;
    }).join('');

    const navHTML = `
        <style>
            .psf-navbar {
                background: var(--color-white, #fff);
                box-shadow: 0 2px 12px rgba(21, 101, 192, 0.1);
                position: sticky;
                top: 0;
                z-index: 50;
            }
            .psf-navbar-inner {
                max-width: 1200px;
                margin: 0 auto;
                padding: 0 1rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
                height: 64px;
            }

            /* Brand */
            .psf-brand {
                display: flex;
                align-items: center;
                gap: 10px;
                text-decoration: none;
            }
            .psf-brand-icon {
                width: 38px;
                height: 38px;
                background: linear-gradient(135deg, #1565C0, #4A9FE8);
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 18px;
            }
            .psf-brand-logo {
                width: 38px;
                height: 38px;
                object-fit: contain;
                border-radius: 10px;
            }
            .psf-brand-text { line-height: 1.1; }
            .psf-brand-name {
                font-size: 1.1rem;
                font-weight: 800;
                color: #1565C0;
                display: block;
            }
            .psf-brand-sub {
                font-size: 0.65rem;
                color: #6B7280;
                display: block;
            }

            /* Desktop nav links */
            .psf-nav-links {
                display: flex;
                align-items: center;
                gap: 4px;
            }
            .nav-item {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 14px;
                border-radius: 8px;
                font-size: 0.875rem;
                font-weight: 500;
                text-decoration: none;
                transition: all 0.2s;
            }
            .nav-item-icon { font-size: 0.8rem; }
            .nav-item-active {
                background: #E3F2FD;
                color: #1565C0;
                font-weight: 700;
            }
            .nav-item-inactive { color: #6B7280; }
            .nav-item-inactive:hover {
                background: #F5F9FF;
                color: #1565C0;
            }

            /* Hamburger */
            .psf-hamburger {
                display: none;
                flex-direction: column;
                gap: 5px;
                cursor: pointer;
                padding: 6px;
                border: none;
                background: none;
            }
            .psf-hamburger span {
                display: block;
                width: 22px;
                height: 2px;
                background: #1565C0;
                border-radius: 2px;
                transition: all 0.3s;
            }

            /* Mobile menu */
            .psf-mobile-menu {
                display: none;
                flex-direction: column;
                padding: 8px 1rem 12px;
                border-top: 1px solid #E3F2FD;
                background: white;
            }
            .psf-mobile-menu.open { display: flex; }
            .psf-mobile-menu .nav-item {
                padding: 10px 12px;
                border-radius: 8px;
            }

            @media (max-width: 640px) {
                .psf-nav-links  { display: none; }
                .psf-hamburger  { display: flex; }
                .psf-brand-sub  { display: none; }
            }
        </style>

        <nav class="psf-navbar">
            <div class="psf-navbar-inner">
                <a href="index.html" class="psf-brand">
                        <img src="/images/logo-psfmedika.png" alt="PSF Medika" class="psf-brand-logo">
                    <div class="psf-brand-text">
                        <span class="psf-brand-name">PSF Medika</span>
                        <span class="psf-brand-sub">Alat Kesehatan Profesional</span>
                    </div>
                </a>

                <div class="psf-nav-links">${linksHTML}</div>

                <button class="psf-hamburger" id="psfHamburger" aria-label="Menu">
                    <span></span><span></span><span></span>
                </button>
            </div>

            <div class="psf-mobile-menu" id="psfMobileMenu">
                ${linksHTML}
            </div>
        </nav>
    `;

    // Inject ke #navbar
    const target = document.getElementById('navbar');
    if (target) {
        target.innerHTML = navHTML;
    }

    // Hamburger toggle
    setTimeout(() => {
        const btn  = document.getElementById('psfHamburger');
        const menu = document.getElementById('psfMobileMenu');
        if (btn && menu) {
            btn.addEventListener('click', () => menu.classList.toggle('open'));
        }
    }, 0);
})();