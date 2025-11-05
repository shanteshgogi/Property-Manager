import { useState } from "react";
import SearchBar from "../SearchBar";

export default function SearchBarExample() {
  const [search, setSearch] = useState("");

  return (
    <div className="p-6 max-w-md">
      <SearchBar
        placeholder="Search tenants..."
        value={search}
        onChange={(value) => {
          setSearch(value);
          console.log("Search:", value);
        }}
      />
      {search && (
        <p className="mt-4 text-sm text-muted-foreground">Searching for: {search}</p>
      )}
    </div>
  );
}
