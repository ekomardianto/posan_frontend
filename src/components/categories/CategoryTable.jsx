import React, { useState } from 'react';
import {
  Coffee,
  CupSoda,
  Utensils,
  Cookie,
  Package,
  Folder,
  MoreVertical,
  Edit2,
  Power,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  PackageX
} from 'lucide-react';

const iconMap = {
  coffee: Coffee,
  beverage: CupSoda,
  food: Utensils,
  dessert: Cookie,
  other: Package
};

export default function CategoryTable({
  categories = [],
  isLoading = false,
  onEditCategory,
  onToggleStatus,
  onDeleteCategory
}) {
  const [activeActionId, setActiveActionId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalItems = categories.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = categories.slice(startIndex, startIndex + itemsPerPage);

  const handleToggleMenu = (id, e) => {
    e.stopPropagation();
    setActiveActionId(activeActionId === id ? null : id);
  };

  React.useEffect(() => {
    const handleOutsideClick = () => setActiveActionId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const renderIcon = (type) => {
    const IconComp = iconMap[type] || Folder;
    return <IconComp size={18} strokeWidth={2} />;
  };

  const renderStationBadge = (station) => {
    const s = (station || 'barista').toLowerCase();
    if (s === 'kitchen') {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 10px',
            borderRadius: '8px',
            fontSize: '0.74rem',
            fontWeight: 700,
            backgroundColor: '#FEF3C7',
            color: '#B45309',
            border: '1px solid #FDE68A',
          }}
        >
          <Utensils size={12} />
          <span>Kitchen (Dapur)</span>
        </span>
      );
    }
    if (s === 'none') {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 10px',
            borderRadius: '8px',
            fontSize: '0.74rem',
            fontWeight: 700,
            backgroundColor: '#F3F4F6',
            color: '#4B5563',
            border: '1px solid #E5E7EB',
          }}
        >
          <PackageX size={12} />
          <span>Tidak Masuk Dapur</span>
        </span>
      );
    }
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '3px 10px',
          borderRadius: '8px',
          fontSize: '0.74rem',
          fontWeight: 700,
          backgroundColor: '#FFF7ED',
          color: '#C2410C',
          border: '1px solid #FFEDD5',
        }}
      >
        <Coffee size={12} />
        <span>Barista</span>
      </span>
    );
  };

  return (
    <div className="category-table-card animate-fade-in" aria-label="Tabel Kategori Produk">
      <div className="table-responsive-wrapper">
        <table className="category-table">
          <thead>
            <tr>
              <th scope="col" style={{ minWidth: '240px' }}>KATEGORI</th>
              <th scope="col">STASIUN DAPUR</th>
              <th scope="col">JUMLAH PRODUK</th>
              <th scope="col">STATUS</th>
              <th scope="col">TERAKHIR DIPERBARUI</th>
              <th scope="col" style={{ textAlign: 'right' }}>AKSI</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem' }}>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Memuat data kategori dari server...</span>
                  </div>
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  Tidak ada kategori yang sesuai dengan pencarian atau filter.
                </td>
              </tr>
            ) : (
              currentItems.map((cat, index) => {
                const isNearBottom = index > 0 && index >= currentItems.length - 2;
                return (
                  <tr key={cat.id}>
                    {/* Category Main Info */}
                    <td>
                      <div className="category-cell-main">
                        <div className="category-icon-box">
                          {renderIcon(cat.iconType)}
                        </div>
                        <div className="category-name-block">
                          <span className="category-name-text">{cat.name}</span>
                          <span className="category-desc-text">{cat.description}</span>
                        </div>
                      </div>
                    </td>

                    {/* Station Badge */}
                    <td>
                      {renderStationBadge(cat.station)}
                    </td>

                    {/* Product Count */}
                    <td>
                      <span className="category-count-cell">{cat.productCount} Produk</span>
                    </td>

                    {/* Status Badge */}
                    <td>
                      <span className={`product-status-badge ${cat.status.toLowerCase()}`}>
                        <span className={`status-dot ${cat.status.toLowerCase()}`} />
                        <span>{cat.status}</span>
                      </span>
                    </td>

                    {/* Updated Time */}
                    <td className="product-date-cell">{cat.updatedAt}</td>

                    {/* Action Menu */}
                    <td className={`product-actions-cell ${activeActionId === cat.id ? 'active' : ''}`}>
                      <button
                        type="button"
                        className="btn-action-more"
                        onClick={(e) => handleToggleMenu(cat.id, e)}
                        aria-label={`Menu aksi untuk kategori ${cat.name}`}
                      >
                        <MoreVertical size={16} />
                      </button>

                      {activeActionId === cat.id && (
                        <div
                          className={`action-menu-dropdown ${isNearBottom ? 'open-up' : ''}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="action-menu-item"
                            onClick={() => {
                              setActiveActionId(null);
                              onEditCategory(cat);
                            }}
                          >
                            <Edit2 size={13} />
                            <span>Edit Kategori</span>
                          </button>

                          <button
                            type="button"
                            className="action-menu-item"
                            onClick={() => {
                              setActiveActionId(null);
                              onToggleStatus(cat);
                            }}
                          >
                            <Power size={13} />
                            <span>{cat.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}</span>
                          </button>

                          <button
                            type="button"
                            className="action-menu-item danger"
                            onClick={() => {
                              setActiveActionId(null);
                              onDeleteCategory(cat);
                            }}
                          >
                            <Trash2 size={13} />
                            <span>Hapus Kategori</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!isLoading && categories.length > 0 && (
        <div className="pagination-footer">
          <div>
            Menampilkan {startIndex + 1}–{Math.min(startIndex + itemsPerPage, totalItems)} dari {totalItems} data
          </div>

          <div className="pagination-controls">
            <button
              type="button"
              className="page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              aria-label="Halaman Sebelumnya"
            >
              <ChevronLeft size={14} />
              <span style={{ marginLeft: 4 }}>Sebelumnya</span>
            </button>

            {(() => {
              let pages = [];
              if (totalPages <= 7) {
                pages = Array.from({ length: totalPages }, (_, i) => i + 1);
              } else if (currentPage <= 4) {
                pages = [1, 2, 3, 4, 5, '...', totalPages];
              } else if (currentPage >= totalPages - 3) {
                pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
              } else {
                pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
              }

              return pages.map((item, idx) => {
                if (item === '...') {
                  return (
                    <span key={`ell-${idx}`} className="page-ellipsis">
                      &hellip;
                    </span>
                  );
                }
                const p = Number(item);
                return (
                  <button
                    key={p}
                    type="button"
                    className={`page-btn ${currentPage === p ? 'active' : ''}`}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                );
              });
            })()}

            <button
              type="button"
              className="page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Halaman Berikutnya"
            >
              <span style={{ marginRight: 4 }}>Berikutnya</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
