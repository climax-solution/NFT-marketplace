import Skeleton from 'react-loading-skeleton'

const items = [...Array(6).keys()];

const ItemDetailsLoading = () => {
    return (
        <section className='container'>
            <div className='row mt-md-5 pt-md-4'>

            <div className="col-md-6 text-center">
                <Skeleton className="img-fluid img-rounded mb-sm-30 ratio ratio-1x1"/>
            </div>
            <div className="col-md-6">
                <div className="item_info">
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
                        {
                            items.map(item => (
                                <div className="col-md-6 col-12 mb-3">
                                    <Skeleton className='ratio ratio-1x1'/>
                                </div>
                            ))
                        }
                    </div>
                    
                </div>
            </div>

            </div>
        </section>
    )
}

export default ItemDetailsLoading;