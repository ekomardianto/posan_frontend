import React, { useState } from 'react';
import { Pencil, MoreVertical, Trash2, Power, Users } from 'lucide-react';

export default function CashierTable({
  cashiers = [],
  onEditCashier,
  onToggleStatus,
  onDeleteCashier,
  currentPage = 1,
  totalCashiers = 1,
  onPageChange
}) {
  const [activeMenuId, setActiveMenuId] = useState(null);

  const toggleMenu = (id, e) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  // Close menu on document click
  React.useEffect(() => {
    const handleClick = () => setActiveMenuId(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="cashier-table-card animate-fade-in" aria-label="Tabel Staf Kasir">
      <div className="cashier-table-responsive">
        <table className="cashier-main-table">
          <thead>
            <tr>
              <th scope="col" className="col-cashier-profile">KASIR</th>
              <th scope="col" className="col-cashier-email">EMAIL</th>
              <th scope="col" className="col-cashier-role">ROLE</th>
              <th scope="col" className="col-cashier-status">STATUS</th>
              <th scope="col" className="col-cashier-created">DIBUAT</th>
              <th scope="col" className="col-cashier-login">LOGIN TERAKHIR</th>
              <th scope="col" className="col-cashier-actions">AKSI</th>
            </tr>
          </thead>
          <tbody>
            {cashiers.map((cashier, index) => {
              const isMenuOpen = activeMenuId === cashier.id;
              const isNearBottom = index > 0 && index >= cashiers.length - 2;

              return (
                <tr key={cashier.id} className="cashier-table-row">
                  {/* KASIR (Avatar + Name + ID) */}
                  <td className="cell-cashier-profile">
                    <div className="cashier-profile-wrapper">
                      <div
                        className="cashier-avatar-circle"
                        style={{
                          backgroundColor: cashier.avatarBg || '#EFE9DF',
                          color: cashier.avatarColor || '#6E5844'
                        }}
                      >
                        {cashier.avatarInitial || cashier.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="cashier-name-id-group">
                        <span className="cashier-full-name">{cashier.name}</span>
                        <span className="cashier-id-sub">ID: {cashier.id}</span>
                      </div>
                    </div>
                  </td>

                  {/* EMAIL */}
                  <td className="cell-cashier-email">
                    <span className="cashier-email-text">{cashier.email}</span>
                  </td>

                  {/* ROLE */}
                  <td className="cell-cashier-role">
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px',
                        backgroundColor:
                          cashier.rawRole === 'barista'
                            ? '#FEF3C7'
                            : cashier.rawRole === 'kitchen'
                            ? '#FFEDD5'
                            : cashier.rawRole === 'admin'
                            ? '#EDE9FE'
                            : '#DCFCE7',
                        color:
                          cashier.rawRole === 'barista'
                            ? '#92400E'
                            : cashier.rawRole === 'kitchen'
                            ? '#9A3412'
                            : cashier.rawRole === 'admin'
                            ? '#6B21A8'
                            : '#166534',
                        border: `1px solid ${
                          cashier.rawRole === 'barista'
                            ? '#FDE68A'
                            : cashier.rawRole === 'kitchen'
                            ? '#FED7AA'
                            : cashier.rawRole === 'admin'
                            ? '#DDD6FE'
                            : '#BBF7D0'
                        }`
                      }}
                    >
                      {cashier.role || 'Kasir'}
                    </span>
                  </td>

                  {/* STATUS */}
                  <td className="cell-cashier-status">
                    <span
                      className={`cashier-status-badge ${
                        cashier.status === 'Aktif' ? 'status-active' : 'status-inactive'
                      }`}
                    >
                      <span className="cashier-status-dot" />
                      <span>{cashier.status}</span>
                    </span>
                  </td>

                  {/* DIBUAT */}
                  <td className="cell-cashier-created">
                    <span className="cashier-created-date">{cashier.createdAt}</span>
                  </td>

                  {/* LOGIN TERAKHIR */}
                  <td className="cell-cashier-login">
                    <span className="cashier-login-time">{cashier.lastLogin}</span>
                  </td>

                  {/* AKSI */}
                  <td className="cell-cashier-actions">
                    <div className="cashier-actions-wrapper">
                      <button
                        type="button"
                        className="btn-action-icon"
                        onClick={() => onEditCashier(cashier)}
                        title="Edit Data Kasir"
                        aria-label={`Edit ${cashier.name}`}
                      >
                        <Pencil size={15} />
                      </button>

                      <div className="cashier-more-menu-wrapper">
                        <button
                          type="button"
                          className="btn-action-icon"
                          onClick={(e) => toggleMenu(cashier.id, e)}
                          title="Menu Aksi Lainnya"
                          aria-label="Menu Opsi"
                        >
                          <MoreVertical size={15} />
                        </button>

                        {isMenuOpen && (
                          <div
                            className={`cashier-dropdown-menu ${isNearBottom ? 'open-up' : ''}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              className="cashier-dropdown-item"
                              onClick={() => {
                                onEditCashier(cashier);
                                setActiveMenuId(null);
                              }}
                            >
                              <Pencil size={13} />
                              <span>Edit Informasi</span>
                            </button>

                            <button
                              type="button"
                              className="cashier-dropdown-item"
                              onClick={() => {
                                onToggleStatus(cashier);
                                setActiveMenuId(null);
                              }}
                            >
                              <Power size={13} />
                              <span>
                                {cashier.status === 'Aktif'
                                  ? 'Nonaktifkan Akun'
                                  : 'Aktifkan Akun'}
                              </span>
                            </button>

                            <div className="cashier-dropdown-divider" />

                            <button
                              type="button"
                              className="cashier-dropdown-item text-danger"
                              onClick={() => {
                                onDeleteCashier(cashier);
                                setActiveMenuId(null);
                              }}
                            >
                              <Trash2 size={13} />
                              <span>Hapus Kasir</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}

            {cashiers.length === 0 && (
              <tr>
                <td colSpan="7" className="cashier-empty-row">
                  <Users size={32} className="cashier-empty-icon" />
                  <p className="cashier-empty-title">Tidak ada data kasir yang sesuai</p>
                  <p className="cashier-empty-desc">
                    Silakan ubah kata kunci pencarian atau tab filter status kasir.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination Footer */}
      <div className="cashier-table-footer">
        <span className="cashier-pagination-info">
          Menampilkan {cashiers.length > 0 ? 1 : 0}–{cashiers.length} dari {totalCashiers} kasir
        </span>

        <div className="cashier-pagination-controls">
          <button
            type="button"
            className="cashier-pagination-btn"
            disabled={currentPage <= 1}
            onClick={() => onPageChange && onPageChange(currentPage - 1)}
          >
            Sebelumnya
          </button>

          <button
            type="button"
            className="cashier-pagination-btn page-number active"
          >
            1
          </button>

          <button
            type="button"
            className="cashier-pagination-btn"
            disabled={true}
          >
            Berikutnya
          </button>
        </div>
      </div>
    </div>
  );
}


