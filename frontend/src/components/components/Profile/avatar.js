import axios from "axios";
import { useState } from "react";
import Skeleton from "react-loading-skeleton";
import { useDispatch, useSelector } from "react-redux";
import { UPDATE_AUTH } from "../../../store/action/auth.action";
import { success_toastify, error_toastify } from "../../../utils/notify";
import "./avatar.css";
import { failedLoadImage } from "../../../utils/compre.js";
import { authSign } from "../../../utils/sign";

export default function Avatar() {
    
    const dispatch = useDispatch();
    const userData = useSelector((state) => state.auth.user);
    const [openChange, setOpenChange] = useState(false);
    const [isLoading, setLoading] = useState(false);

    const updateAvatar = async(e) => {
        const files = e.target.files;
        if (files[0].type.indexOf("image") > -1) {
          let fileData = new FormData();
          fileData.append("myfile", files[0]);
          setLoading(true);
          try {
            const signature = await authSign(userData.walletAddress, 'update avatar');
            fileData.append("signature", signature);
            fileData.append("walletAddress", userData.walletAddress);
            await axios.post(
              `${process.env.REACT_APP_BACKEND}user/update-avatar`,
              fileData
            ).then(res => {
              dispatch(UPDATE_AUTH(res.data));
              success_toastify("Updated avatar successfully!");
            }).catch(err => {
              error_toastify("Update failed");
            })
          } catch(err) {
            
          }
          setLoading(false);
        }
    }

    return (
      <>
        <div
          className="avatar-image position-relative w-50"
          onMouseEnter={() => isLoading ? null : setOpenChange(true)}
          onMouseLeave={() => isLoading ? null : setOpenChange(false)}
        >
            {
              isLoading ? (
                <Skeleton className="position-absolute rounded-circle index-avatar"/>
              )
              : <>
                <img
                  src={`${process.env.REACT_APP_BACKEND}avatar/${userData.avatar ? userData.avatar : "empty-avatar.png"}`}
                  className="position-absolute index-avatar"
                  onError={failedLoadImage}
                  alt=""
                  crossOrigin="true"
                />
                { openChange &&
                  <label className="avatar-change">
                      <i className="fa fa-edit edit-btn m-0 d-inline-block"/>
                      <input
                      type="file"
                      accept="image/*"
                      onChange={updateAvatar}
                      hidden
                      />
                  </label>
                }
              </>
            }
        </div>
      </>
    )
}