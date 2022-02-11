import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
    .react-loading-skeleton {
        background-color: #2a2b2c !important;
        background-image: linear-gradient(90deg ,#2a2b2c,#444,#2a2b2c ) !important;
    }
`;
const ItemDetailsLoading = () => {
    return (
        <>
            <GlobalStyles/>
            <SkeletonTheme>
                <section className='container'>
                    <div className='row mt-md-5 pt-md-4'>

                    <div className="col-md-6 text-center">
                        <Skeleton className="img-fluid img-rounded mb-sm-30 ratio ratio-1x1"/>
                    </div>
                    <div className="col-md-6">
                        <div className="item_info">
                            Auctions ends in 
                            <div className="de_countdown">
                                <Skeleton/>
                            </div>
                            <h2><Skeleton/></h2>
                            <div className="item_info_counts">
                                <Skeleton/>
                            </div>
                            <p><Skeleton/></p>

                            <div className="spacer-40"></div>
                            <div className='row'>
                                <div className="col-md-6 col-12 mb-3">
                                    <Skeleton className='ratio ratio-1x1'/>
                                </div>
                                <div className="col-md-6 col-12 mb-3">
                                    <Skeleton className='ratio ratio-1x1'/>
                                </div>
                                <div className="col-md-6 col-12 mb-3">
                                    <Skeleton className='ratio ratio-1x1'/>
                                </div>
                                <div className="col-md-6 col-12 mb-3">
                                    <Skeleton className='ratio ratio-1x1'/>
                                </div>
                                <div className="col-md-6 col-12 mb-3">
                                    <Skeleton className='ratio ratio-1x1'/>
                                </div>
                                <div className="col-md-6 col-12 mb-3">
                                    <Skeleton className='ratio ratio-1x1'/>
                                </div>
                            </div>
                            
                        </div>
                    </div>

                    </div>
                </section>
            </SkeletonTheme>
        </>
    )
}

export default ItemDetailsLoading;