export function nextDisplayOrder(items) {
  const used = new Set(items.map((item) => Number(item.displayOrder)));
  let order = 0;
  while (used.has(order)) order += 1;
  return order;
}

export function displayOrderIsTaken(items, order, editingId) {
  return items.some(
    (item) => item.id !== editingId && Number(item.displayOrder) === Number(order),
  );
}

export const displayOrderConflictMessage =
  "This display order is already used. Choose another number.";
