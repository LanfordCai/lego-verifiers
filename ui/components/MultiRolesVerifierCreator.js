import Image from "next/image"
import React, { useState } from "react"
import { useRecoilState } from "recoil"
import {
  transactionInProgressState,
  transactionStatusState
} from "../lib/atoms"
import * as fcl from "@onflow/fcl"
import { classNames, generateScript } from "../lib/utils"
import ImageSelector from "./ImageSelector"
import MultiRolesView from "./MultiRolesView"
import VerificationModeSelector, { ModeNormal } from "./VerificationModeSelector"
import { addVerifier } from "../flow/transactions"
import { useRouter } from "next/router"

const NamePlaceholder = "Verifier's Name";
const GuildIdPlaceholder = "906264258189332541";
const DescriptionPlaceholder = "Details about this verifier"

const BasicInfoMemoizeImage = React.memo(({ image }) => {
  return (
    <div className="rounded-full shrink-0 h-[144px] aspect-square bg-white relative sm:max-w-[460px] ring-1 ring-black ring-opacity-10 overflow-hidden">
      <Image src={image} alt="" className="rounded-2xl" layout="fill" objectFit="cover" />
    </div>
  )
})
BasicInfoMemoizeImage.displayName = "BasicInfoMemozieImage"

export default function MultiRolesVerifierCreator(props) {
  const { user } = props
  const router = useRouter()
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [transactionStatus, setTransactionStatus] = useRecoilState(transactionStatusState)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState(null)
  const [imageSize, setImageSize] = useState(0)
  const [guildId, setGuildId] = useState(0);
  const [roleVerifiers, setRoleVerifiers] = useState([])
  const [mode, setMode] = useState(ModeNormal)

  const canCreateLego = () => {
    return !transactionInProgress && roleVerifiers.length > 0 && name.trim().length > 0
  }

  const handleSubmit = async (event) => {
    if (!(props.user && props.user.loggedIn)) {
      fcl.authenticate()
      return
    }

    const script = generateScript(roleVerifiers, mode)
    const roleIds = roleVerifiers.map((rv) => rv.roleID)

    const res = await addVerifier(
      name, 
      description || "", 
      image || "",
      script, 
      guildId,
      roleIds, 
      `${mode.raw}`,
      setTransactionInProgress,
      setTransactionStatus
    )

    handleCreationResponse(res)
  }

  const handleCreationResponse = (res) => {
    if (res && res.status === 4 && res.statusCode === 0) {
      router.push("/profile")
    }
  }

  return (
    <div className="flex flex-col gap-y-10">
      <div className="flex flex-row justify-between gap-x-10">
        <div className="flex flex-col justify-between">
          <label className="block text-2xl font-bold font-flow">
            Image
          </label>
          <label className="block text-md font-flow leading-6 mt-2 mb-2">Should not be larger than 500 KB.</label>
          <ImageSelector imageSelectedCallback={(_image, _imageSize) => {
            setImage(_image)
            setImageSize(_imageSize)
          }} />
        </div>
        <BasicInfoMemoizeImage image={image || "/lego.png"} />
      </div>

      <div className="flex flex-col gap-y-2">
        <label className="block text-2xl font-bold font-flow">
          Guild Id<span className="text-red-600">*</span>
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="guildid"
            id="guildid"
            disabled={transactionInProgress}
            required
            className="block w-full font-flow text-lg rounded-2xl px-3 py-2
            border border-emerald focus:border-emerald-dark
            outline-0 focus:outline-2 focus:outline-emerald-dark 
            placeholder:text-gray-300"
            placeholder={GuildIdPlaceholder}
            onChange={(event) => {
              setGuildId(event.target.value)
            }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-y-2">
        <label className="block text-2xl font-bold font-flow">
          Name<span className="text-red-600">*</span>
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="name"
            id="name"
            disabled={transactionInProgress}
            required
            className="block w-full font-flow text-lg rounded-2xl px-3 py-2
            border border-emerald focus:border-emerald-dark
            outline-0 focus:outline-2 focus:outline-emerald-dark 
            placeholder:text-gray-300"
            placeholder={NamePlaceholder}
            onChange={(event) => {
              setName(event.target.value)
            }}
          />
        </div>
      </div>

      {/** description */}
      <div className="flex flex-col gap-y-2">
        <label className="block text-2xl font-bold font-flow">
          Description
        </label>
        <div className="mt-1">
          <textarea
            rows={4}
            name="description"
            id="description"
            disabled={transactionInProgress}
            className="focus:ring-emerald-dark rounded-2xl px-3 py-2
                bg-emerald-ultralight resize-none block w-full font-flow text-lg placeholder:text-gray-300
                border border-emerald focus:border-emerald-dark
                outline-0 focus:outline-2 focus:outline-emerald-dark"

            defaultValue={''}
            spellCheck={false}
            placeholder={DescriptionPlaceholder}
            onChange={(event) => { setDescription(event.target.value) }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-y-2">
        <label className="block text-2xl font-bold font-flow">
          Verification Mode
        </label>
        <VerificationModeSelector mode={mode} setMode={setMode} />
      </div>

      <MultiRolesView
        roleVerifiers={roleVerifiers}
        setRoleVerifiers={setRoleVerifiers}
      />

      <div>
        <button
          type="button"
          className={classNames(
            !canCreateLego() ? "bg-emerald-light text-gray-500" : "bg-emerald hover:bg-emerald-dark text-black",
            "mt-24 w-full h-[56px] text-lg font-semibold rounded-2xl shadow-drizzle"
          )}
          disabled={!canCreateLego()}
          onClick={() => {
            handleSubmit()
          }}
        >
          {user.loggedIn ? "Create Lego Verifier" : "Connect Wallet"}
        </button>
      </div>

    </div>
  )
}