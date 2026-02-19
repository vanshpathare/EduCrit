import ItemCard from "./ItemCard";

const ItemGrid = ({
  items,
  showActions = false,
  onDelete,
  variant = "list",
}) => {
  return (
    <div
      className={`grid gap-4 
      ${
        variant === "grid"
          ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" // Standard grid for Latest
          : "grid-cols-1 md:grid-cols-3 lg:grid-cols-4" // Amazon list for All Items
      }`}
    >
      {items.map((item) => (
        <ItemCard
          key={item._id}
          item={item}
          showActions={showActions}
          onDelete={onDelete}
          variant={variant}
        />
      ))}
    </div>
  );
};

export default ItemGrid;
