import React from 'react';

export default function CategoryFooterCards() {
  return (
    <section className="category-bottom-grid animate-fade-in" aria-label="Informasi Integrasi Kategori">
      {/* 1. Kategori Terpopuler */}
      <article className="category-info-card">
        <img
          src="https://images.unsplash.com/photo-1541167760496-1628856ab772?w=150&auto=format&fit=crop&q=80"
          alt="Coffee & Signature"
          className="info-card-thumb"
        />
        <div className="info-card-body">
          <span className="info-card-tag">KATEGORI TERPOPULER</span>
          <h3 className="info-card-title">Koleksi Coffee &amp; Signature</h3>
          <p className="info-card-desc">
            Menyumbang 64% total transaksi harian di gerai dengan racikan minuman siap saji.
          </p>
        </div>
      </article>

      {/* 2. Integrasi Menu Kasir */}
      <article className="category-info-card">
        <img
          src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=150&auto=format&fit=crop&q=80"
          alt="Integrasi POS"
          className="info-card-thumb"
        />
        <div className="info-card-body">
          <span className="info-card-tag">INTEGRASI MENU KASIR</span>
          <h3 className="info-card-title">Sinkronisasi Instan</h3>
          <p className="info-card-desc">
            Setiap perubahan kategori langsung terhubung secara seamless ke terminal pemesanan front-desk.
          </p>
        </div>
      </article>
    </section>
  );
}
