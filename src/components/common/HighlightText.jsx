const HighlightText = ({ text, match }) => {
  if (text == null) return "-";
  const str = String(text);
  if (!match) return str;

  const regex = new RegExp(`(${match})`, "gi");

  return (
    <>
      {str.split(regex).map((part, index) =>
        part.toLowerCase() === match.toLowerCase() ? (
          <mark
            key={index}
            style={{
              backgroundColor: "#261d54",
              color: "#ffffff",
              padding: "0 0.25rem",
              borderRadius: "0.25rem",
            }}
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
};

export default HighlightText;