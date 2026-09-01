export function Spacer({ size = 16, horizontal = false }) {
  return (
    <div
      style={{
        width: horizontal ? size : 0,
        height: horizontal ? 0 : size,
        flex: '0 0 auto',
      }}
    />
  );
}