import axios from "axios";
import { useState } from "react";
import Skeleton from "react-loading-skeleton";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { createGlobalStyle } from "styled-components";
import { UPDATE_AUTH } from "../../../store/action/auth.action";

const GlobalStyles = createGlobalStyle`
  .avatar-image {
    max-width: 150px;
  }
`;

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
            "http://localhost:7060/user/update-avatar",
            fileData,
            {
              headers: {
                Authorization: JSON.parse(token),
                'Content-Type': 'multipart/form-data'
              }
            }
          ).then(res => {
            dispatch(UPDATE_AUTH(res.data));
            toast.success("Updated avatar successfully!", {
              position: "top-center",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "colored"
            });
          }).catch(err => {
            toast.error("Update failed", {
              position: "top-center",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "colored"
            });
          })
          setLoading(false);
        }
    }

    const failedLoadImage = (e) => {
      e.target.src = "/img/empty-avatar.png";
    }

    return (
      <>
        <GlobalStyles/>
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
                  src={`http://localhost:7060/avatar/${userData.avatar ? userData.avatar : "empty-avatar.png"}`}
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