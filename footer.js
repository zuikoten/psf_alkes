(function () {
  // ── State ──────────────────────────────────────────────────────────
  let categories = [];

  // ── Helper Functions ──────────────────────────────────────────────
  function escapeHtml(str) {
    if (!str) return "";
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return str.replace(/[&<>"']/g, function (m) {
      return map[m];
    });
  }

  // ── Format Rupiah ──────────────────────────────────────────────────
  function formatRupiah(number) {
    return new Intl.NumberFormat("id-ID").format(number);
  }

  // ── Fetch Categories from Server ──────────────────────────────────
  async function fetchCategories() {
    try {
      const response = await fetch("/get-categories");
      const data = await response.json();

      if (data.success && data.categories) {
        // Data sudah terurut dari server berdasarkan produk_count
        // Ambil 6 kategori dengan produk terbanyak
        categories = data.categories.slice(0, 6);
        return true;
      } else {
        throw new Error(data.error || "Gagal memuat kategori");
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      // Fallback ke kategori statis
      categories = [
        { id: 1, nama_kategori: "Alat Diagnostik", produk_count: 12 },
        { id: 2, nama_kategori: "Alat Bedah", produk_count: 8 },
        { id: 3, nama_kategori: "APD", produk_count: 15 },
        { id: 4, nama_kategori: "Alat Laboratorium", produk_count: 10 },
        { id: 5, nama_kategori: "Alat Bantu Jalan", produk_count: 6 },
        { id: 6, nama_kategori: "Disposable", produk_count: 20 },
      ];
      return false;
    }
  }

  // ── Generate Category Links ──────────────────────────────────────
  function getCategoryLinksHTML() {
    if (!categories || categories.length === 0) {
      return `
                <li class="category-skeleton">
                    <i class="fas fa-spinner fa-spin"></i> Memuat kategori...
                </li>
            `;
    }

    return categories
      .map(
        (cat) => `
            <li>
                <a href="katalog_produk.html?kategori=${cat.id}" class="footer-category-link">
                    <i class="fas fa-chevron-right"></i> 
                    ${escapeHtml(cat.nama_kategori)}
                    ${cat.produk_count ? `<span class="category-count">(${cat.produk_count})</span>` : ""}
                </a>
            </li>
        `,
      )
      .join("");
  }

  // ── Generate Footer HTML ──────────────────────────────────────────
  function generateFooterHTML() {
    const categoryLinks = getCategoryLinksHTML();

    return `
        <style>
            .psf-footer {
                background: linear-gradient(135deg, #0D47A1, #1A237E);
                color: white;
                padding: 3rem 0 1.5rem;
                margin-top: 3rem;
                border-top: 4px solid #4A9FE8;
                position: relative;
            }
            .psf-footer::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #4A9FE8, #64B5F6, #4A9FE8);
                background-size: 200% 100%;
                animation: gradientMove 3s ease-in-out infinite;
            }
            @keyframes gradientMove {
                0%, 100% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
            }

            .psf-footer-inner {
                max-width: 1200px;
                margin: 0 auto;
                padding: 0 1.5rem;
                display: grid;
                grid-template-columns: 2fr 1fr 1fr 1fr;
                gap: 2rem;
            }

            /* Brand Section */
            /* Tambahkan style untuk logo */
            .psf-footer-logo-wrapper {
                display: flex;
                align-items: center;
                gap: 14px;
                margin-bottom: 0.75rem;
            }
            .psf-footer-logo-icon {
                width: 50px;
                height: 50px;
                background: linear-gradient(135deg, #1565C0, #4A9FE8);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 24px;
                flex-shrink: 0;
                box-shadow: 0 4px 12px rgba(21, 101, 192, 0.3);
            }
            .psf-footer-brand-title {
                font-size: 1.5rem;
                font-weight: 800;
                margin: 0;
                line-height: 1.2;
                background: linear-gradient(135deg, #64B5F6, #E3F2FD);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            .psf-footer-brand-sub {
                font-size: 0.7rem;
                color: rgba(255,255,255,0.5);
                display: block;
                margin-top: 0;
            }
            .psf-footer-brand p {
                color: rgba(255,255,255,0.8);
                line-height: 1.6;
                font-size: 0.9rem;
                margin-bottom: 1rem;
            }
            .psf-footer-social {
                display: flex;
                gap: 0.75rem;
                margin-top: 1rem;
            }
            .psf-footer-social a {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 38px;
                height: 38px;
                border-radius: 50%;
                background: rgba(255,255,255,0.1);
                color: white;
                text-decoration: none;
                transition: all 0.3s;
                font-size: 1rem;
            }
            .psf-footer-social a:hover {
                background: #4A9FE8;
                transform: translateY(-3px);
                box-shadow: 0 4px 12px rgba(74, 159, 232, 0.4);
            }

            /* Section Titles */
            .psf-footer-section h4 {
                font-size: 1rem;
                font-weight: 700;
                margin-bottom: 1rem;
                color: #64B5F6;
                text-transform: uppercase;
                letter-spacing: 1px;
                position: relative;
                padding-bottom: 0.5rem;
            }
            .psf-footer-section h4::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                width: 30px;
                height: 2px;
                background: #4A9FE8;
            }

            .psf-footer-section ul {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            .psf-footer-section ul li {
                margin-bottom: 0.6rem;
            }
            .psf-footer-section ul li a {
                color: rgba(255,255,255,0.8);
                text-decoration: none;
                font-size: 0.875rem;
                transition: all 0.3s;
                display: inline-flex;
                align-items: center;
                gap: 6px;
            }
            .psf-footer-section ul li a:hover {
                color: white;
                transform: translateX(4px);
            }
            .psf-footer-section ul li a i {
                font-size: 0.7rem;
                color: #4A9FE8;
            }

            .footer-category-link {
                cursor: pointer;
                position: relative;
            }

            .category-count {
                font-size: 0.7rem;
                color: rgba(255,255,255,0.5);
                background: rgba(255,255,255,0.1);
                padding: 0 6px;
                border-radius: 4px;
                font-weight: 400;
                margin-left: 2px;
            }

            .category-skeleton {
                color: rgba(255,255,255,0.4);
                font-size: 0.875rem;
            }
            .category-skeleton i {
                margin-right: 8px;
            }

            /* Category popularity badge */
            .category-popular-badge {
                display: inline-block;
                font-size: 0.55rem;
                background: linear-gradient(135deg, #FF6B6B, #FF4757);
                color: white;
                padding: 1px 8px;
                border-radius: 12px;
                font-weight: 700;
                margin-left: 6px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            /* Contact Info */
            .psf-footer-contact li {
                color: rgba(255,255,255,0.8);
                font-size: 0.875rem;
                display: flex;
                align-items: flex-start;
                gap: 10px;
                margin-bottom: 0.75rem;
            }
            .psf-footer-contact li i {
                color: #4A9FE8;
                font-size: 1rem;
                margin-top: 3px;
                min-width: 18px;
            }

            /* Bottom Bar */
            .psf-footer-bottom {
                max-width: 1200px;
                margin: 2rem auto 0;
                padding: 1.5rem 1.5rem 0;
                border-top: 1px solid rgba(255,255,255,0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 0.5rem;
            }
            .psf-footer-bottom p {
                color: rgba(255,255,255,0.7);
                font-size: 0.8rem;
                margin: 0;
            }
            .psf-footer-bottom .psf-footer-license {
                color: rgba(255,255,255,0.6);
                font-size: 0.7rem;
            }
            .psf-footer-bottom-links {
                display: flex;
                gap: 1.5rem;
            }
            .psf-footer-bottom-links a {
                color: rgba(255,255,255,0.7);
                text-decoration: none;
                font-size: 0.8rem;
                transition: color 0.3s;
            }
            .psf-footer-bottom-links a:hover {
                color: white;
            }

            /* Responsive */
            @media (max-width: 992px) {
                .psf-footer-inner {
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }
            }
            @media (max-width: 640px) {
                .psf-footer-inner {
                    grid-template-columns: 1fr;
                    gap: 1.5rem;
                }
                .psf-footer {
                    padding: 2rem 0 1rem;
                    margin-top: 2rem;
                }
                .psf-footer-brand-title {
                    font-size: 1.25rem;
                }
                .psf-footer-logo-icon {
                    width: 40px;
                    height: 40px;
                    font-size: 18px;
                }
                .psf-footer-logo-wrapper {
                    gap: 10px;
                }
                .psf-footer-bottom {
                    flex-direction: column;
                    text-align: center;
                    gap: 0.75rem;
                }
                .psf-footer-bottom-links {
                    flex-wrap: wrap;
                    justify-content: center;
                }
                .psf-footer-section h4::after {
                    left: 50%;
                    transform: translateX(-50%);
                }
                .psf-footer-section {
                    text-align: center;
                }
                .psf-footer-social {
                    justify-content: center;
                }
                .psf-footer-contact li {
                    justify-content: center;
                }
            }
        </style>

        <footer class="psf-footer">
            <div class="psf-footer-inner">
                <!-- Brand Section dengan Logo -->
                <div class="psf-footer-brand">
                    <div class="psf-footer-logo-wrapper">
                        <div class="psf-footer-logo-icon">
                            <img src="/images/logo-psfmedika.png" alt="PSF Medika" class="psf-footer-logo-img">
                        </div>
                        <div>
                            <div class="psf-footer-brand-title">PSF Medika</div>
                            <span class="psf-footer-brand-sub">Alat Kesehatan Profesional</span>
                        </div>
                    </div>
                    <p>Distributor alat kesehatan profesional terpercaya di Indonesia. Melayani kebutuhan rumah sakit, klinik, laboratorium, praktik mandiri dan kebutuhan pribadi.</p>
                    <div class="psf-footer-social">
                        <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
                        <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                        <a href="#" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
                        <a href="#" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a>
                        <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
                    </div>
                </div>

                <!-- Quick Links -->
                <div class="psf-footer-section">
                    <h4>Tautan Cepat</h4>
                    <ul>
                        <li><a href="index.html"><i class="fas fa-chevron-right"></i> Beranda</a></li>
                        <li><a href="katalog_produk.html"><i class="fas fa-chevron-right"></i> Katalog</a></li>
                        <li><a href="tentang.html"><i class="fas fa-chevron-right"></i> Tentang Kami</a></li>
                        <li><a href="kontak.html"><i class="fas fa-chevron-right"></i> Kontak</a></li>
                    </ul>
                </div>

                <!-- Kategori Populer -->
                <div class="psf-footer-section">
                    <h4>Kategori Populer</h4>
                    <ul id="footerCategories">
                        ${categoryLinks}
                    </ul>
                </div>

                <!-- Contact Info -->
                <div class="psf-footer-section">
                    <h4>Hubungi Kami</h4>
                    <ul class="psf-footer-contact">
                        <li>
                            <i class="fas fa-map-marker-alt"></i>
                            <span>Central Business District, Sentrakota<br />
                            No. B16, RT.001 / RW.003, Jatibening Baru<br />
                            Kecamatan Pondokgede, Kota Bekasi<br />
                            Jawa Barat 17412</span>
                        </li>
                        <li>
                            <i class="fas fa-phone"></i>
                            <span>+62 821-1537-138</span>
                        </li>
                        <li>
                            <i class="fas fa-envelope"></i>
                            <span>cs@psfmedika.com</span>
                        </li>
                        <li>
                            <i class="fas fa-clock"></i>
                            <span>Senin - Jumat: 08.00 - 17.00 WIB</span>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Bottom Bar -->
            <div class="psf-footer-bottom">
                <div>
                    <p>&copy; 2026 PSF Medika. All rights reserved.</p>
                    <p class="psf-footer-license">Izin Kemenkes RI &middot; AKD 21603129105</p>
                </div>
                <div class="psf-footer-bottom-links">
                    <a href="#">Kebijakan Privasi</a>
                    <a href="#">Syarat &amp; Ketentuan</a>
                    <a href="#">Garansi</a>
                </div>
            </div>
        </footer>
    `;
  }

  // ── Update Categories in Footer ──────────────────────────────────
  function updateCategoriesInFooter() {
    const container = document.getElementById("footerCategories");
    if (!container) return;

    if (!categories || categories.length === 0) {
      container.innerHTML = `
                <li class="category-skeleton">
                    <i class="fas fa-spinner fa-spin"></i> Memuat kategori...
                </li>
            `;
      return;
    }

    // Tentukan kategori dengan produk terbanyak untuk badge "🔥 Populer"
    const maxProducts =
      categories.length > 0 ? categories[0].produk_count || 0 : 0;

    container.innerHTML = categories
      .map((cat, index) => {
        const isPopular = index === 0 && cat.produk_count > 0;
        return `
                <li>
                    <a href="katalog_produk.html?kategori=${cat.id}" class="footer-category-link">
                        <i class="fas fa-chevron-right"></i> 
                        ${escapeHtml(cat.nama_kategori)}
                        ${cat.produk_count ? `<span class="category-count">(${cat.produk_count})</span>` : ""}
                        ${isPopular ? `<span class="category-popular-badge">🔥 Populer</span>` : ""}
                    </a>
                </li>
            `;
      })
      .join("");
  }

  // ── Main Init Function ────────────────────────────────────────────
  async function initFooter() {
    // 1. Inject footer HTML
    const target = document.getElementById("footer");
    if (!target) {
      console.error("Element #footer not found");
      return;
    }

    // Inject dengan skeleton loading
    target.innerHTML = generateFooterHTML();

    // 2. Fetch categories
    await fetchCategories();

    // 3. Update kategori di footer
    updateCategoriesInFooter();
  }

  // ── Run when DOM ready ────────────────────────────────────────────
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFooter);
  } else {
    initFooter();
  }
})();
