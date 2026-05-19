import s from "./Loaders.module.css";

interface LoaderProps {
    message?: string;
}

const Loader = ({ message, colorClass }: { message?: string; colorClass: string }) => (
    <div className={s.loaderWrapper}>
        <div className={`${s.ring} ${colorClass}`}>
            <div /><div /><div /><div />
        </div>
        {message && <p className={`${s.loaderText} ${colorClass}`}>{message}</p>}
    </div>
);

export const SendLoader = () => (
    <div className={s.sendDots}>
        <span /><span /><span />
    </div>
);

export const CardLoader = ({ message }: LoaderProps) => (
    <div className={s.loaderOverlay}>
        <div className={`${s.ring} ${s.green}`}>
            <div /><div /><div /><div />
        </div>
        {message && <p className={`${s.loaderText} ${s.green}`}>{message}</p>}
    </div>
);

export const DeleteLoader = ({ message }: LoaderProps) => <Loader message={message} colorClass={s.red} />;
export const GreenLoader = ({ message }: LoaderProps) => <Loader message={message} colorClass={s.green} />;
export const RedLoader = ({ message }: LoaderProps) => <Loader message={message} colorClass={s.red} />;
export const CreatingGroupLoader = ({ message }: LoaderProps) => <Loader message={message} colorClass={s.green} />;
export const GreyLoader = ({ message }: LoaderProps) => <Loader message={message} colorClass={s.grey} />;