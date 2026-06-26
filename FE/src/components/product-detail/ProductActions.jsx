import { useState } from "react";

function Spinner() {
  return (
    <span
      style={{
        display: "inline-block",
        width: "16px",
        height: "16px",
        borderRadius: "50%",
        border: "2px solid currentColor",
        borderRightColor: "transparent",
        animation: "ff-spin 0.7s linear infinite",
        flexShrink: 0,
      }}
    />
  );
}

export default function ProductActions({
  rentPriceText,
  salePriceText,
  isRentable = true,
  onRent,
  onBuy,
  loadingAction,
  canSubmit,
  canRent,
  canBuy,
  productImage,
}) {
  const renting = loadingAction === "rent";
  const buying = loadingAction === "buy";
  const rentAllowed = canRent !== undefined && canRent !== null ? canRent : canSubmit;

  return (
    <>
      <style>{`
        @keyframes ff-spin {
          to { transform: rotate(360deg); }
        }

        .ff-actions-wrap {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .ff-btn-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .ff-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 50px;
          padding: 0 24px;
          border-radius: 999px;
          font-weight: 900;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          cursor: pointer;
          border: 0;
          transition: background 0.18s, transform 0.15s, box-shadow 0.18s;
          white-space: nowrap;
        }

        .ff-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          transform: none !important;
        }

        /* Buy = dark with neon */
        .ff-btn-buy {
          background: #10150f;
          color: #c9ff3d;
          box-shadow: 0 8px 24px rgba(16, 21, 15, 0.18);
        }

        .ff-btn-buy:not(:disabled):hover {
          background: #1b241b;
          transform: translateY(-2px);
        }

        /* Rent = neon green (primary CTA) */
        .ff-btn-rent {
          background: #c9ff3d;
          color: #10150f;
          box-shadow: 0 10px 28px rgba(201, 255, 61, 0.38);
        }

        .ff-btn-rent:not(:disabled):hover {
          background: #d8ff5a;
          transform: translateY(-2px);
          box-shadow: 0 14px 36px rgba(201, 255, 61, 0.50);
        }

        /* Add to cart = outlined */
        .ff-btn-cart {
          background: #fffaf0;
          color: #10150f;
          border: 1px solid rgba(16, 21, 15, 0.12);
        }

        .ff-btn-cart:not(:disabled):hover {
          background: #ebe7dc;
          transform: translateY(-1px);
        }

        .ff-badges {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .ff-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 700;
          color: #596255;
          padding: 6px 12px;
          border-radius: 999px;
          border: 1px solid rgba(16, 21, 15, 0.1);
          background: #fffaf0;
        }

        /* ── Mobile sticky bar ── */
        .ff-mobile-bar {
          position: fixed;
          inset-x: 0; bottom: 0; z-index: 40;
          background: rgba(246, 247, 239, 0.96);
          border-top: 1px solid rgba(16, 21, 15, 0.1);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          padding: 12px 16px;
        }

        @media (min-width: 768px) {
          .ff-mobile-bar { display: none; }
        }

        @media (max-width: 767px) {
          .ff-actions-wrap { display: none; }
        }

        .ff-mobile-inner {
          max-width: 500px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .ff-mobile-price {
          flex: 1; min-width: 0;
        }

        .ff-mobile-price p:first-child {
          font-size: 11px; color: #8d9788;
          margin: 0 0 2px; text-transform: uppercase; font-weight: 700; letter-spacing: .05em;
        }

        .ff-mobile-price p:last-child {
          font-size: 16px; font-weight: 900;
          color: #10150f; margin: 0;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .ff-btn-sm {
          height: 44px;
          padding: 0 18px;
          border-radius: 999px;
          font-weight: 900;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: .03em;
          cursor: pointer;
          border: 0;
          transition: background .18s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .ff-btn-sm:disabled { opacity: 0.45; cursor: not-allowed; }
        .ff-btn-sm-buy { background: #10150f; color: #c9ff3d; }
        .ff-btn-sm-buy:not(:disabled):hover { background: #1b241b; }
        .ff-btn-sm-rent { background: #c9ff3d; color: #10150f; }
        .ff-btn-sm-rent:not(:disabled):hover { background: #d8ff5a; }
      `}</style>

      {/* ── Desktop layout ── */}
      <div className="ff-actions-wrap">
        <div className={isRentable ? "ff-btn-row" : ""}>
          <button
            type="button"
            onClick={onBuy}
            disabled={!canBuy || renting || buying}
            className="ff-btn ff-btn-buy"
            style={!isRentable ? { width: "100%" } : {}}
          >
            {buying && <Spinner />}
            Mua ngay
          </button>

          {isRentable && (
            <button
              type="button"
              onClick={onRent}
              disabled={!rentAllowed || renting || buying}
              className="ff-btn ff-btn-rent"
            >
              {renting && <Spinner />}
              Thuê ngay
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onBuy}
          disabled={!canBuy || renting || buying}
          className="ff-btn ff-btn-cart"
          style={{ width: "100%" }}
        >
          Thêm vào giỏ
        </button>

        <div className="ff-badges">
          <span className="ff-badge">✓ Miễn phí đổi trả</span>
          <span className="ff-badge">✓ Bao gồm bảo dưỡng</span>
        </div>
      </div>

      {/* ── Mobile sticky bar ── */}
      <div className="ff-mobile-bar">
        <div className="ff-mobile-inner">
          {isRentable && (
            <div className="ff-mobile-price-col">
              <span className="ff-mobile-price-label">Giá thuê / ngày</span>
              <span className="ff-mobile-price-val">{rentPriceText}</span>
            </div>
          )}
          <div className="ff-mobile-price-col">
            <span className="ff-mobile-price-label">Giá mua</span>
            <span className="ff-mobile-price-val">{salePriceText || 'Liên hệ'}</span>
          </div>
          <div className="ff-mobile-actions">
            {isRentable && (
              <button
                type="button"
                onClick={onRent}
                disabled={!rentAllowed || renting || buying}
                className="ff-btn-sm ff-btn-sm-rent"
              >
                {renting && <Spinner />}
                Thuê ngay
              </button>
            )}
            <button
              type="button"
              onClick={onBuy}
              disabled={!canBuy || renting || buying}
              className="ff-btn-sm ff-btn-sm-buy"
              style={!isRentable ? { width: "100%", justifyContent: "center" } : {}}
            >
              {buying && <Spinner />}
              Mua ngay
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
