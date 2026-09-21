import { site } from "@/lib/site";

/**
 * Placeholder QR block. Replace public/upi-qr.svg with the foundation's real
 * QR image and it is used automatically.
 */
export function UpiQr() {
  return (
    <div className="qr-row">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="qr"
        src={site.bank.qrImage}
        alt={`UPI QR code for ${site.bank.upi}`}
        width={168}
        height={168}
      />
      <div>
        <p style={{ fontWeight: 600 }}>Scan to pay by UPI</p>
        <p className="hint" style={{ maxWidth: "26ch", marginTop: ".3rem" }}>
          Works with GPay, PhonePe, Paytm, BHIM and any UPI app.
        </p>
      </div>
    </div>
  );
}
