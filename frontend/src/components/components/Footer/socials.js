const socials =  [
    {id: 0, link: 'https://facebook.com/NFTDevelopments', icon: 'fab fa-facebook'},
    {id: 1, link: 'https://twitter.com/NFTDevelopments', icon: 'fab fa-twitter'},
    {id: 2, link: 'https://instagram.com/NFTDevelopments', icon: 'fab fa-instagram'},
    {id: 3, link: 'https://tiktok.com/@NFTDevelopments', icon: 'fab fa-tiktok'},
    {id: 4, link: 'https://www.youtube.com/channel/UCbPW7kuPqflfqplBZy8knsg', icon: 'fab fa-youtube'},
    {id: 5, link: 'https://www.linkedin.com/in/nft-developments-372a08222/', icon: 'fab fa-linkedin'},
    {id: 6, link: 'mailto:Enquire@NFTDevelopments.com', icon: 'fa fa-envelope'},
    {id: 7, link: 'https://t.me/NFTdevelopments', icon: 'fab fa-telegram'},
];

export default function SocialLinks() {
    return (
        <div className="subfooter">
            <div className="container">
                <div className="row">
                    <div className="col-md-12">
                        <div className="de-flex">
                            <div className="de-flex-col">
                                <span onClick={()=> window.open("", "_self")}>
                                    <span className="copy">&copy; Copyright 2022 - NFT Developments Marketplace Powered By Binance</span>
                                </span>
                            </div>
                            <div className="de-flex-col">
                                <div className="social-icons">
                                    {
                                        socials.map((item, index) => {
                                            return (
                                                <span onClick={()=> window.open(`${item.link}`, "_blank")} key={index}><i className={item.icon}></i></span>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}