import { useState, useEffect } from "react";
import { Button } from "react-bootstrap";

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

    return (
        <Button 
            variant="link" 
            onClick={toggleFavorite}
            style={{ 
                color: isFav ? '#ffc107' : '#555', 
                fontSize: '1.5rem',
                padding: 0,
                lineHeight: 1,
                textDecoration: 'none',
                position: 'absolute',
                top: '10px',
                left: '10px',
                zIndex: 10
            }}
        >
            {isFav ? '★' : '☆'}
        </Button>
    );
};