import Image from "next/image";
import { useTranslations } from "next-intl";

export function Header() {
    const t = useTranslations();

    return (
        <header className="eneo-gradient">
            <div className="max-w-4xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <Image
                        src="/logo.png"
                        alt="Logo Eneo Cameroon SA"
                        width={150}
                        height={50}
                        className="h-12 w-auto cursor-pointer"
                        onClick={(e) => { e.preventDefault(); window.location.href = "/" }}
                    />
                    <div className="text-white text-right">
                        <h2 className="text-lg font-semibold">{t("header.title")}</h2>
                        <p className="text-sm opacity-90">
                            {t("header.subtitle")}
                        </p>
                    </div>
                </div>
            </div>
        </header>
    )
}