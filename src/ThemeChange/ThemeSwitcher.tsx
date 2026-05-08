import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { BsSunFill, BsMoonFill } from "react-icons/bs";
import styles from './ThemeSwitcher.module.css';

export const ThemeSwitcher = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <Button
      variant={theme === "light" ? "outline-dark" : "outline-light"}
      onClick={toggleTheme}
      className={styles.themeBtn}
    >
      {theme === "light" ? (
        <BsMoonFill size={16} color="#000000" />
      ) : (
        <BsSunFill size={18} color="#ffffff" />
      )}
    </Button>
  );
};