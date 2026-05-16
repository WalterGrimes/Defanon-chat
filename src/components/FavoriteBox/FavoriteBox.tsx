    import { useState, useEffect } from "react";
    import styles from "./FavoriteBox.module.css";

    interface FavoriteBoxProps {
        guid: string;
    }

    export const FavoriteBox = ({ guid }: FavoriteBoxProps) => {
        const [isFav, setIsFav] = useState(false);

        useEffect(() => {
            const favs = JSON.parse(localStorage.getItem('fav_boxes') || '[]');
            setIsFav(favs.includes(guid));
        }, [guid]);

        const toggleFavorite = (e: React.MouseEvent) => {
            e.stopPropagation();

            const favs: string[] = JSON.parse(localStorage.getItem('fav_boxes') || '[]');
            let updatedFavs;

            if (favs.includes(guid)) {
                updatedFavs = favs.filter(id => id !== guid);
                setIsFav(false);
            } else {
                updatedFavs = [...favs, guid];
                setIsFav(true);
            }

            localStorage.setItem('fav_boxes', JSON.stringify(updatedFavs));
            window.dispatchEvent(new Event('favUpdated'));
        };

        const buttonClass = `${styles.favButton} ${isFav ? styles.isFav : ""}`;

        return (
            <button
                onClick={toggleFavorite}
                className={buttonClass}
                aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
            >
                {isFav ? '★' : '☆'}
            </button>
        );
    };