pragma solidity ^0.8.0;

import { PhotoNFT } from "../../PhotoNFT.sol";


contract PhotoNFTDataObjects {

    struct Photo {  // [Key]: index of array
        PhotoNFT photoNFT;
        string photoNFTName;
        string photoNFTSymbol;
        address ownerAddress;
        uint photoPrice;
        string ipfsHashOfPhoto;
        string status;  // "Open" or "Cancelled"
        uint256 reputation;
        bool premiumStatus; //0 : not, 1 : premium
        string photoNFTDesc;
        uint256 premiumTimestamp;
        uint256 createdAt;
    }

}
