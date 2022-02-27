import Skeleton from "react-loading-skeleton";
import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
    .react-loading-skeleton {
        background-color: #2a2b2c !important;
        background-image: linear-gradient(90deg ,#2a2b2c,#444,#2a2b2c ) !important;
    }
`;

const TopSellerLoading = () => {
    return (
        <>
            <GlobalStyles/>
            <div>
                <ul className="author_list list-unstyled">
                    <li>
                        <Skeleton
                            height={50}
                        />
                    </li>
                    <li>
                        <Skeleton
                            height={50}
                        />
                    </li>
                    <li>
                        <Skeleton
                            height={50}
                        />
                    </li>
                    <li>
                        <Skeleton
                            height={50}
                        />
                    </li>
                    <li>
                        <Skeleton
                            height={50}
                        />
                    </li>
                    <li>
                        <Skeleton
                            height={50}
                        />
                    </li>
                    <li>
                        <Skeleton
                            height={50}
                        />
                    </li>
                    <li>
                        <Skeleton
                            height={50}
                        />
                    </li>
                    <li>
                        <Skeleton
                            height={50}
                        />
                    </li>
                    <li>
                        <Skeleton
                            height={50}
                        />
                    </li>
                    <li>
                        <Skeleton
                            height={50}
                        />
                    </li>
                    <li>
                        <Skeleton
                            height={50}
                        />
                    </li>
                </ul>
            </div>
        </>
    )
}

export default TopSellerLoading;