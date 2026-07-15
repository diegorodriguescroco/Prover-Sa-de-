export default function Logo({ size = 120, white = false }) {
  return (
    <img
      src="/logo.png"
      alt="Prover Saúde"
      style={{
        height: size,
        width: 'auto',
        objectFit: 'contain',
        filter: white ? 'brightness(0) invert(1)' : 'none',
      }}
    />
  );
}
