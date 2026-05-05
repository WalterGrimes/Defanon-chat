import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";

export const ThemeToggle = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "dark"); 
    
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <Button 
      variant={theme === "light" ? "outline-dark" : "outline-light"} 
      onClick={toggleTheme}
      className="ms-2"
    >
      {theme === "light" ? "Dark Mode" : " Light Mode"}
    </Button>
  );
};