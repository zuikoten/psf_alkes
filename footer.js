(function () {
    const footerHTML = `
        <style>
            .psf-footer {
                background: linear-gradient(135deg, #0D47A1, #1565C0);
                color: white;
                padding: 2rem 0;
                margin-top: 3rem;
                border-top: 4px solid #4A9FE8;
            }
            .psf-footer-inner {
                max-width: 1200px;
                margin: 0 auto;
                padding: 0 1rem;
                text-align: center;
            }
            .psf-footer-title {
                font-size: 1.125rem;
                font-weight: 700;
                margin-bottom: 0.25rem;
            }
            .psf-footer-sub {
                font-size: 0.875rem;
                opacity: 0.9;
                margin-bottom: 0.25rem;
            }
            .psf-footer-divider {
                border-top: 1px solid rgba(255,255,255,0.2);
                margin: 1rem 0;
                padding-top: 1rem;
            }
            .psf-footer-small {
                font-size: 0.75rem;
                opacity: 0.85;
            }
            .psf-footer-highlight {
                font-weight: 700;
                color: white;
            }
            .psf-footer-license {
                font-size: 0.75rem;
                opacity: 0.85;
                margin-top: 0.25rem;
            }

            /* Responsive */
            @media (max-width: 640px) {
                .psf-footer {
                    padding: 1.5rem 0;
                    margin-top: 2rem;
                }
                .psf-footer-title {
                    font-size: 1rem;
                }
                .psf-footer-sub {
                    font-size: 0.75rem;
                }
            }
        </style>

        <footer class="psf-footer">
            <div class="psf-footer-inner">
                <p class="psf-footer-title">
                    &copy; 2026 PSF Medika - Toko Alat Kesehatan Terpercaya
                </p>
                <p class="psf-footer-sub">
                    Melayani kebutuhan medis rumah sakit, klinik, dan pribadi
                </p>
            </div>
        </footer>
    `;

    // Inject ke #footer
    const target = document.getElementById('footer');
    if (target) {
        target.innerHTML = footerHTML;
    }
})();