import React, { useState, useEffect } from "react";
import { NotificationManager } from "react-notifications";
import { useDispatch, useSelector } from "react-redux";
import styled, { createGlobalStyle } from "styled-components";
import Swal from 'sweetalert2'
import { UPDATE_LOADING_PROCESS } from "../../store/action/auth.action";
import Empty from "./Empty";
import addresses from "../../config/address.json";
const { marketplace_addr } = addresses;

const Outer = styled.div`
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 8px;
`;

const GlobalStyles = createGlobalStyle`
    .trade-btn-group {
        span {
            padding: 2px 10px;
        }
    }
`;
export default function SellingNFT(props) {

    const dispatch = useDispatch();
    const initUserData = useSelector((state) => state.auth.user);
    const [web3, setWeb3] = useState({});
    const [NFT, setNFT] = useState({});
    const [Marketplace, setMarketplace] = useState({});
    const [nfts, setNFTs] = useState([]);
    const [height, setHeight] = useState(0);

    const onImgLoad = ({target:img}) => {
        let currentHeight = height;
        if(currentHeight < img.offsetHeight) {
            setHeight(img.offsetHeight);
        }
    }
    
    useEffect(() => {
        const { _web3, data, _insNFT, _insMarketplace} = props;
        if (_insMarketplace) {
            setWeb3(_web3);
            setNFTs(data);
            setNFT(_insNFT);
            setMarketplace(_insMarketplace);
        }
    },[props])

    const putOnSale = async (id) => {
        console.log(id);
        await Swal.fire({
            title: '<span style="font-size: 22px">PLEASE ENTER PRICE</span>',
            input: 'number',
            width: 350,
            inputAttributes: {
              autocapitalize: 'off',
            },
            inputValidator: (value) => {
              if (value < 0.1)  return "Price must be greater than 0.1.";
            },
            color: '#000',
            showCancelButton: true,
            confirmButtonText: 'OK',
            showLoaderOnConfirm: true,
            allowOutsideClick: () => !Swal.isLoading()
          }).then(async(result) => {
            if (result.isConfirmed) {
                dispatch(UPDATE_LOADING_PROCESS(true));
                try {
                    const nftPrice = web3.utils.toWei((result.value).toString(), 'ether');
                    await NFT.methods.approve(marketplace_addr, id).send({from : initUserData.walletAddress})
                    .on('receipt', async(rec) => {
                        await Marketplace.methods.openTradeToDirect(id).send({ from: initUserData.walletAddress, value: nftPrice / 40 });
                        NotificationManager.success("Success");
                        dispatch(UPDATE_LOADING_PROCESS(false));
                    });
                  
                } catch(err) {
                    NotificationManager.error("Failed");
                    dispatch(UPDATE_LOADING_PROCESS(false));
                }
            }
        })
    }

    const putOnAuction = async (id) => {
        await Swal.fire({
            title: '<span style="font-size: 22px">PLEASE ENTER AUCTION DETAILS  </span>',
            inputAttributes: {
              autocapitalize: 'off',
            },
            html:
                '<input type="number" id="auction-price" class="swal2-input" placeholder="Please input auction price.">' +
                '<input type="number" id="auction-period" class="swal2-input" placeholder="Please input auction period.">',
            focusConfirm: false,
            preConfirm: () => {
                if (document.getElementById('auction-price').value < 0.1) {
                    Swal.showValidationMessage('Auction price must be higher than 0.1 BNB');   
                }

                else if (!document.getElementById('auction-period').value || document.getElementById('auction-period').value > 7 ) {
                   Swal.showValidationMessage('Auction period must be 1 ~ 7days')   
                }
                
                else return [ document.getElementById('auction-price').value, document.getElementById('auction-period').value ]
            },
            color: '#000',
            showCancelButton: true,
            confirmButtonText: 'OK',
            showLoaderOnConfirm: true,
            allowOutsideClick: () => !Swal.isLoading()
          }).then(async(result) => {
            if (result.isConfirmed) {
                dispatch(UPDATE_LOADING_PROCESS(true));
                try {
                    const nftPrice = web3.utils.toWei(result.value[0], 'ether');
                    await NFT.methods.approve(marketplace_addr, id).send({from : initUserData.walletAddress})
                    .on('receipt', async(rec) => {
                        await Marketplace.methods.openTradeToAuction(id, nftPrice, result.value[1]).send({ from: initUserData.walletAddress, value: nftPrice / 40 });
                        NotificationManager.success("Success");
                        dispatch(UPDATE_LOADING_PROCESS(false));
                    });
                  
                } catch(err) {
                    NotificationManager.error("Failed");
                    dispatch(UPDATE_LOADING_PROCESS(false));
                }
            }
        })
    }

    return (
        <div className='row'>
            <GlobalStyles/>
            {nfts.map( (nft, index) => (
                <div key={index} className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12">
                    <div className="nft__item">
                        <div className="nft__item_wrap" style={{height: `${height}px`}}>
                        <Outer>
                            <span>
                                <img onLoad={onImgLoad} src={nft.image} className="lazy nft__item_preview" alt=""/>
                            </span>
                        </Outer>
                        </div>
                        <div className="nft__item_info">
                            <span onClick={()=> window.open(nft.nftLink, "_self")}>
                                <h4>{nft.nftName}</h4>
                            </span>
                            <div className="nft__item_price">
                                {web3.utils.fromWei(nft.marketData.price, "ether")} BNB
                            </div>
                            <div className="pb-4 trade-btn-group">
                                { !nft.marketData.marketStatus && <span className="btn-main w-100" onClick={() => putOnSale(nft.nftData.tokenID)}>Put on Sale</span> }
                                {!nft.auctionData.existance && <span className="btn-main w-100 mt-2" onClick={() => putOnAuction(nft.nftData.tokenID)}>Put on Auction</span> }
                            </div>
                        </div> 
                    </div>
                </div>  
            ))}

            {!nfts.length && <Empty/>}
            
        </div>
    )
}