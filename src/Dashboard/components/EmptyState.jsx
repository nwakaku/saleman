import { memo } from "react";
import { LuPlus } from "react-icons/lu";

const EmptyState = () => (
  <div className="text-center py-12 text-green-500">
    <LuPlus className="mx-auto text-5xl mb-4" />
    <p className="text-xl">Add your first menu item</p>
  </div>
);

export default memo(EmptyState);
