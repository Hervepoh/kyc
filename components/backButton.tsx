import React from 'react'
import { useTranslations } from 'next-intl';
import { MoveLeft } from 'lucide-react';


const BackButton = () => {
     const t = useTranslations();

    return (
        <div className="mt-5 flex items-center justify-end">
            <span
                onClick={(e) => { e.preventDefault(); window.location.href = "/" }}
                className="flex items-center justify-center gap-2 text-xs text-[#14689E] text-right hover:underline cursor-pointer"
            >
              <MoveLeft />  {t("kycForm.buttons.home")}
            </span>
        </div>
    )
}

export default BackButton