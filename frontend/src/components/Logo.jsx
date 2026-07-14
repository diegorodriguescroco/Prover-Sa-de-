export default function Logo({ size = 120 }) {
  return (
    <img
      src="/logo.png"
      alt="Prover Saúde"
      style={{ height: size, width: 'auto', objectFit: 'contain' }}
    />
  );
}
