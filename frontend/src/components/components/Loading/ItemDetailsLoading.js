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

                            <div className="de_tab">

                            <ul className="de_nav">
                                <li id='Mainbtn' className="active"><span >Bids</span></li>
                                <li id='Mainbtn1' className=''><span>History</span></li>
                            </ul>
                            
                            <div className="de_tab_content">
                                <div className="tab-1 onStep fadeIn">
                                    <div className="p_list"><Skeleton/></div>
                                    <div className="p_list"><Skeleton/></div>
                                    <div className="p_list"><Skeleton/></div>
                                    <div className="p_list"><Skeleton/></div>
                                    <div className="p_list"><Skeleton/></div>
                                </div>
                                
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