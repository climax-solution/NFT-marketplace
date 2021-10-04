pragma solidity ^0.5.16;
pragma experimental ABIEncoderV2;

import { ERC721Full } from "./openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol";
import { SafeMath } from "./openzeppelin-solidity/contracts/math/SafeMath.sol";


/**
 * @notice - This is the NFT contract for a photo
 */
contract PhotoNFT is ERC721Full {
    using SafeMath for uint256;

    uint256 public currentPhotoId;

    event PhotoNFTCreated (
        address owner,
        uint photoId
    );

    //for debug
    event PhotoNFTStatus (
        address user, 
        address currentOwner, 
        address contractAddress
    );

    enum State { Open, Cancelled }

    struct Photo {  /// [Key]: index of array
        // PhotoNFT photoNFT;
        // string photoNFTName;
        // string photoNFTSymbol;
        uint256 photoId;
        address ownerAddress;
        string photoName;
        uint photoPrice;
        string ipfsHashOfPhoto;
        State status;  /// "Open" =0,  "Cancelled" = 1, 
        uint256 reputation;
    }

    Photo[] public photos;
    
    constructor( ) 
        public 
        ERC721Full("PhotoNFT", "PhotoNFT-marketplace") 
    {
        // mint(owner, _tokenURI);
        //set contract to approve transfer
        // setApprovalForAll(address(this), true);
    }

    /** 
     * @dev mint a photoNFT
     * @dev tokenURI - URL include ipfs hash
     * photoPrice - price of photo when it is minted
     */
    function mint(string memory tokenURI, uint photoPrice, string memory photoName) public returns (bool) {
        /// Mint a new PhotoNFT
        // address memory to = msg.sender
        _mint(msg.sender, currentPhotoId);
        //after mint save the Photo to photos array
        Photo memory photo = Photo({
            photoId : currentPhotoId, 
            ownerAddress: msg.sender,
            photoPrice: photoPrice,
            photoName : photoName,
            ipfsHashOfPhoto: tokenURI,
            status: State.Cancelled,  //Cancelled
            reputation: 0
        });
        photos.push(photo);
        _setTokenURI(currentPhotoId, tokenURI);
        //emit Event
        emit PhotoNFTCreated(msg.sender, currentPhotoId);
        currentPhotoId++;
    }

    function getPhoto(uint index) public view returns (Photo memory _photo) {
        Photo memory photo = photos[index];
        return photo;
    }

    function getAllPhotos() public view returns (Photo[] memory _photos) {
        return photos;
    }

    function openTrade(uint photoId) public {
        require(photos[photoId].ownerAddress == msg.sender, "different user");
        require(ownerOf(photoId) == msg.sender, "NFT must be owned by user");
        require(photos[photoId].status == State.Cancelled, "Status must be Cancelled");

        photos[photoId].status = State.Open;

        //approve contract to transfer
        approve(address(this), photoId);
        // _transferFrom(msg.sender, address(this), photoId);
    }

    function cancelTrade(uint photoId) public {
        require(photos[photoId].ownerAddress == msg.sender, "different user");
        // require(ownerOf(photoId) == address(this), "NFT must be owned by contract"); 
        require(photos[photoId].status == State.Open, "Status must be Open");

        // //change photo status to "Cancelled"
        photos[photoId].status = State.Cancelled;
        
        //approve sender to transfer
        approve(address(0), photoId);
        // _transferFrom(address(this), msg.sender, photoId);
    }

    function buyNFT(uint photoId) public payable returns (bool) {

        Photo memory photo = photos[photoId];
        

        address _seller = photo.ownerAddress;                     /// Owner
        address payable seller = address(uint160(_seller));  /// Convert owner address with payable
        uint buyAmount = photo.photoPrice;
        require (msg.value == buyAmount, "msg.value should be equal to the buyAmount");
        
 
        /// Bought-amount is transferred into a seller wallet
        seller.transfer(buyAmount);

        address buyer = msg.sender;

        //update the photo data
        photos[photoId].ownerAddress = buyer;
        photos[photoId].status = State.Cancelled; // set the state to "Cancelled"
        _transferFrom(_seller,  msg.sender, photoId);
    }
}
