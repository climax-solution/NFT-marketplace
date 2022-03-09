import axios from "axios";
import { lazy, Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { UPDATE_LOADING_PROCESS } from "../../../store/action/auth.action";
import getWeb3 from "../../../utils/getWeb3";
import addresses from "../../../config/address.json";
import { toast } from "react-toastify";

const { marketplace_addr } = addresses;

const MusicArt = lazy(() => import("../Asset/music"));
const VideoArt = lazy(() => import("../Asset/video"));
const ItemLoading = lazy(() => import("../Loading/ItemLoading"));

export default function NotSaleNFT({ data, NFT, Marketplace }) {

    const [web3, setWeb3] = useState(null);
    const [nft, setNFT] = useState([]);
    const [isLoading, setLoading] = useState(true);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const initialUser = useSelector(({ auth }) => auth.user);
    const wallet_info = useSelector(({ wallet }) => wallet.wallet_connected);

    const putOnSale = async (id) => {
        
        if (!wallet_info) {
            toast.warning('Please connect metamask', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
        theme: "colored"
            });
            return;
        }

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
                    
                    const _bnbBalance = await web3.eth.getBalance(initialUser.walletAddress);
                    const _estApproveGas = await NFT.methods.approve(marketplace_addr, id).estimateGas({from : initialUser.walletAddress });
                    const _estClaimGas = await Marketplace.methods.openTradeToDirect(id).estimateGas({ from: initialUser.walletAddress, value: nftPrice / 40 });

                    if (Number(nftPrice / 40) + Number(_estApproveGas) + Number(_estClaimGas) > Number(_bnbBalance)) throw new Error("BNB balance is low");

                    await NFT.methods.approve(marketplace_addr, id).send({from : initialUser.walletAddress})
                    .on('receipt', async(rec) => {
                        await Marketplace.methods.openTradeToDirect(id).send({ from: initialUser.walletAddress, value: nftPrice / 40 });
                        toast.success('Success', {
                            position: "top-center",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
        theme: "colored"
                        });
                        const data = {
                            tokenID: id,
                            type: 1,
                            price: nftPrice / 40,
                            walletAddress: initialUser.walletAddress
                        }
        
                        await axios.post('http://nftdevelopments.co.nz/activity/create-log', data).then(res =>{
        
                        }).catch(err => { });
                        dispatch(UPDATE_LOADING_PROCESS(false));
                    });
                  
                } catch(err) {
                    console.log(err);
                    toast.error(err.message, {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
        theme: "colored"
            });;
                    dispatch(UPDATE_LOADING_PROCESS(false));
                }
            }
        })
    }

    const putOnAuction = async (id) => {
        
        if (!wallet_info) {
            toast.warning('Please connect metamask', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
        theme: "colored"
            });
            return;
        }

        await Swal.fire({
            title: '<span style="font-size: 22px">PLEASE ENTER AUCTION DETAILS  </span>',
            inputAttributes: {
              autocapitalize: 'off',
            },
            html:
                '<input type="number" id="auction-price" class="swal2-input" placeholder="Please input price.">' +
                '<input type="number" id="auction-period" class="swal2-input" placeholder="Please input period.">',
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
                    
                    const _bnbBalance = await web3.eth.getBalance(initialUser.walletAddress);
                    const _estApproveGas = await NFT.methods.approve(marketplace_addr, id).estimateGas({from : initialUser.walletAddress });
                    const _estClaimGas = await Marketplace.methods.openTradeToAuction(id, nftPrice, Math.floor(result.value[1] * 24)).estimateGas({ from: initialUser.walletAddress, value: nftPrice / 40 });

                    if (Number(nftPrice / 40) + Number(_estApproveGas) + Number(_estClaimGas) > Number(_bnbBalance)) throw new Error("BNB balance is low");

                    await NFT.methods.approve(marketplace_addr, id).send({from : initialUser.walletAddress})
                    .on('receipt', async(rec) => {
                        await Marketplace.methods.openTradeToAuction(id, nftPrice, Math.floor(result.value[1] * 24)).send({ from: initialUser.walletAddress, value: nftPrice / 40 });

                        const data = {
                            tokenID: id,
                            type: 5,
                            price: nftPrice / 40,
                            walletAddress: initialUser.walletAddress
                        }
                        toast.success('Success', {
                            position: "top-center",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: "colored"
                        });
                        await axios.post('http://nftdevelopments.co.nz/activity/create-log', data).catch(res => {}).catch(err => { });
                        dispatch(UPDATE_LOADING_PROCESS(false));
                    });
                  
                } catch(err) {
                    toast.error(err.message, {
                        position: "top-center",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "colored"
                    });
                    dispatch(UPDATE_LOADING_PROCESS(false));
                }
            }
        })
    }

    useEffect(async() => {
        if (data) {
            const { _web3 } = await getWeb3();
            setWeb3(_web3);
            await axios.get(data.nftData.tokenURI).then(res => {
                setNFT({ ...data, ...res.data });
            }).catch(err => {

            })
            setLoading(false);
        }
    },[data])

    const failedLoadImage = (e) => {
        e.target.src="/img/empty.jfif";
    }

    return (
        <Suspense fallback={<ItemLoading/>}>
            {
                isLoading ? <ItemLoading/>
                : (
                    <div className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12">
                        <div className="nft__item h-100 justify-content-between">
                            <div className="nft__item_wrap">
                                {
                                    (!nft.type || nft.type && (nft.type).toLowerCase() == 'image') && <img src={nft.image} onError={failedLoadImage} role="button" className="lazy nft__item_preview" onClick={() => navigate(`/item-detail/${nft.nftData.tokenID}`)} alt=""/>
                                }

                                {
                                    (nft.type && (nft.type).toLowerCase() == 'music') && <MusicArt data={nft} link={`/item-detail/${nft.nftData.tokenID}`}/>
                                }

                                {
                                    (nft.type && (nft.type).toLowerCase() == 'video') && <VideoArt data={nft.asset}/>
                                }
                            </div>
                            <div className="nft__item_info">
                                <span>
                                    <h4 onClick={() => !isLoading ? navigate(`/item-detail/${nft.nftData.tokenID}`) : null }>{ nft.nftName }</h4>
                                </span>
                                <div className="nft__item_price">{ web3.utils.fromWei(nft.marketData.price, "ether")} BNB </div>
                                <div className="pb-4 trade-btn-group mt-2">
                                    { !nft.marketData.marketStatus && <span className="btn-main w-100" onClick={() => putOnSale(nft.nftData.tokenID)}>List</span> }
                                    {!nft.auctionData.existance && <span className="btn-main w-100 mt-2" onClick={() => putOnAuction(nft.nftData.tokenID)}>List as an auction</span> }
                                </div>
                            </div> 
                        </div>
                    </div>
                )
            }
        </Suspense>
    )
}