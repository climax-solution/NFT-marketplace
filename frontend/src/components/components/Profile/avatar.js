import axios from "axios";
import { useState } from "react";
import { NotificationManager } from "react-notifications";
import { useDispatch, useSelector } from "react-redux";
import { UPDATE_AUTH } from "../../../store/action/auth.action";
import Loading from "../Loading/Loading";

export default function Avatar() {
    
    const dispatch = useDispatch();
    const userData = useSelector((state) => state.auth.user);
    const [openChange, setOpenChange] = useState(false);
    const [isLoading, setLoading] = useState(false);

    const updateAvatar = async(e) => {
        const files = e.target.files;
        const token = localStorage.getItem("nftdevelopments-token");
        if (files[0].type.indexOf("image") > -1) {
          let fileData = new FormData();
          fileData.append("myfile", files[0]);
          setLoading(true);
          await axios.post(
            "http://nftdevelopments.co.nz/user/update-avatar",
            fileData,
            {
              headers: {
                Authorization: JSON.parse(token),
                'Content-Type': 'multipart/form-data'
              }
            }
          ).then(res => {
            dispatch(UPDATE_AUTH(res.data));
            NotificationManager.success("Updated avatar successfully!");
          }).catch(err => {
            console.log(err);
            NotificationManager.error("Update failed");
          })
          setLoading(false);
        }
    }

    const failedLoadImage = (e) => {
      e.target.src = "/img/empty-avatar.png";
    }

    return (
      <>
        { isLoading && <Loading/> }
        <div
            className="avatar-image position-relative w-50 overflow-hidden"
            onMouseEnter={() => setOpenChange(true)}
            onMouseLeave={() => setOpenChange(false)}
        >
            <img
              src={`http://nftdevelopments.co.nz/avatar/${userData.avatar ? userData.avatar : "empty-avatar.png"}`}
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
        </div>
      </>
    )
}