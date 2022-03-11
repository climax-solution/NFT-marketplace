import Skeleton from "react-loading-skeleton";

export default function ItemLoading() {
    return (
        <div className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 pb-3">
            <div className="nft__item position-relative h-100 justify-content-between">
                <div className="nft__item_wrap">
                    <span>
                        <Skeleton className="lazy nft__item_preview ratio ratio-1x1"/>
                    </span>
                </div>
                <div className="nft__item_info">
                    <span>
                        <h4><Skeleton/></h4>
                    </span>
                    <span className="d-block mb-4">
                        <Skeleton/>
                    </span>
                </div>
            </div>
        </div>
    )
}