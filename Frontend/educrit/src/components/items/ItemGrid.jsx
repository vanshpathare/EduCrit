import ItemCard from "./ItemCard";

const ItemGrid = ({ items, showActions = false, onDelete }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      {items.map((item) => (
        <ItemCard
          key={item._id}
          item={item}
          showActions={showActions}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default ItemGrid;
