import React, { useState } from 'react';
import { MoreVertical, Edit2, Power, Trash2, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

export default function ProductTable({
  products = [],
  isLoading = false,
  onEditProduct,
  onToggleStatus,
  onDeleteProduct
}) {
  const [activeActionId, setActiveActionId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Pagination calculation
  const totalItems = products.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = products.slice(startIndex, startIndex + itemsPerPage);

  const handleToggleMenu = (id, e) => {
    e.stopPropagation();
    setActiveActionId(activeActionId === id ? null : id);
  };

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleOutsideClick = () => setActiveActionId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const renderCategoryBadge = (category) => {
    const catClass = (category || '').toLowerCase();
    return (
      <span className={`category-badge ${catClass}`}>
        {category || 'Lainnya'}
      </span>
    );
  };

  return (
    <div className="product-catalog-card animate-fade-in" aria-label="Katalog Menu & Produk">
      <div className="table-responsive-wrapper">
        <table className="products-table">
          <thead>
            <tr>
              <th scope="col" style={{ minWidth: '260px' }}>PRODUK</th>
              <th scope="col">KATEGORI</th>
              <th scope="col">HARGA</th>
              <th scope="col">STATUS</th>
              <th scope="col">TERAKHIR DIPERBARUI</th>
              <th scope="col" style={{ textAlign: 'right' }}>AKSI</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }, (_, rowIndex) => (
                <tr key={`product-skeleton-${rowIndex}`} aria-hidden="true">
                  {Array.from({ length: 6 }, (_, cellIndex) => (
                    <td key={cellIndex}>
                      <div className="h-3 my-3 rounded bg-stone-200 animate-pulse" style={{ width: `${45 + ((rowIndex + cellIndex) % 4) * 12}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  Tidak ada produk yang sesuai dengan pencarian atau filter.
                </td>
              </tr>
            ) : (
              currentItems.map((product, index) => {
                const isNearBottom = index > 0 && index >= currentItems.length - 2;
                return (
                  <tr key={product.id}>
                    {/* Product Meta */}
                    <td>
                      <div className="product-info-cell">
                        <div className="product-thumb-container">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="product-thumb-img"
                              loading="lazy"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                const nextSibling = e.target.nextElementSibling;
                                if (nextSibling) nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className="product-thumb-placeholder"
                            style={{ display: product.imageUrl ? 'none' : 'flex' }}
                          >
                            <ImageIcon size={18} />
                          </div>
                        </div>
                        <div className="product-text-details">
                          <span className="product-name-title">{product.name}</span>
                          <span className="product-desc-snippet" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>
                              {product.station === 'kitchen' ? '🍳 Kitchen (Makanan)' : '☕ Barista (Minuman)'}
                            </span>
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td>
                      {renderCategoryBadge(product.category)}
                    </td>

                    {/* Price */}
                    <td>
                      <span className="product-price-cell">{product.formattedPrice}</span>
                    </td>

                    {/* Status Badge */}
                    <td>
                      <span className={`product-status-badge ${product.status.toLowerCase()}`}>
                        <span className={`status-dot ${product.status.toLowerCase()}`} />
                        <span>{product.status}</span>
                      </span>
                    </td>

                    {/* Last Updated */}
                    <td className="product-date-cell">{product.updatedAt}</td>

                    {/* Action Menu */}
                    <td className={`product-actions-cell ${activeActionId === product.id ? 'active' : ''}`}>
                      <button
                        type="button"
                        className="btn-action-more"
                        onClick={(e) => handleToggleMenu(product.id, e)}
                        aria-label={`Menu aksi untuk produk ${product.name}`}
                      >
                        <MoreVertical size={16} />
                      </button>

                      {activeActionId === product.id && (
                        <div
                          className={`action-menu-dropdown ${isNearBottom ? 'open-up' : ''}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="action-menu-item"
                            onClick={() => {
                              setActiveActionId(null);
                              onEditProduct(product);
                            }}
                          >
                            <Edit2 size={13} />
                            <span>Edit Produk</span>
                          </button>

                          <button
                            type="button"
                            className="action-menu-item"
                            onClick={() => {
                              setActiveActionId(null);
                              onToggleStatus(product);
                            }}
                          >
                            <Power size={13} />
                            <span>{product.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}</span>
                          </button>

                          <button
                            type="button"
                            className="action-menu-item danger"
                            onClick={() => {
                              setActiveActionId(null);
                              onDeleteProduct(product);
                            }}
                          >
                            <Trash2 size={13} />
                            <span>Hapus Produk</span>
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
      {!isLoading && products.length > 0 && (
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
