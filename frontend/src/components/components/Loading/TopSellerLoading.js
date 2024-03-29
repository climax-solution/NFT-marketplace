import Skeleton from "react-loading-skeleton";
const items = [...Array(4).keys()];

const TopSellerLoading = () => {
    return (
        <div>
            <ul className="author_list list-unstyled">
                {
                    items.map((item, index) => (
                        <li key={index}>
                            <Skeleton
                                height={50}
                            />
                        </li>
                    ))
                }
            </ul>
        </div>
    )
}

export default TopSellerLoading;