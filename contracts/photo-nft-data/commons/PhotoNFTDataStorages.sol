pragma solidity ^0.8.0;

import { PhotoNFTDataObjects } from "./PhotoNFTDataObjects.sol";


// shared storage
contract PhotoNFTDataStorages is PhotoNFTDataObjects {

    Photo[] public photos;

}

