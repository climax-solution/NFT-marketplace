import ItemLoading from "./ItemLoading";
const items = [...Array(4).keys()];

const PremiumNFTLoading = () => {
    return (
        <div className="row">
            {
                items.map(item => (
                    <div className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 pb-3">
                        <ItemLoading/>
                    </div>
                ))
            }
        </div>
    )
}

export default PremiumNFTLoading;