import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XIcon } from '@heroicons/react/outline'
import RoleVerifierCreator from './RoleVerifierCreator'
import DiscordRoleSelector from './DiscordRoleSelector'
import LogicSelector, { BasicVerifiersLogic } from './LogicSelector'
import { useRecoilState } from "recoil"
import {
  showBasicNotificationState,
  basicNotificationContentState
} from "../lib/atoms.js"

export default function RoleVerifierCreatorSlideOver(props) {
  const [, setShowBasicNotification] = useRecoilState(showBasicNotificationState)
  const [, setBasicNotificationContent] = useRecoilState(basicNotificationContentState)

  const { open, setOpen,
    createNewRoleVerifier, roleVerifierToBeEdit } = props
  const [selectedRole, setSelectedRole] = useState(null)

  const [basicVerifiersLogic, setBasicVerifiersLogic] = useState(BasicVerifiersLogic.AND)
  const [basicVerifiers, setBasicVerifiers] = useState([])

  useEffect(() => {
    if (roleVerifierToBeEdit) {
      setSelectedRole(roleVerifierToBeEdit.role)
      setBasicVerifiersLogic(roleVerifierToBeEdit.basicVerifiersLogic)
      setBasicVerifiers(roleVerifierToBeEdit.basicVerifiers)
    } else if (open) {
      setSelectedRole(null)
      setBasicVerifiersLogic(BasicVerifiersLogic.AND)
      setBasicVerifiers([])
    }
  }, [roleVerifierToBeEdit, open])

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-400"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-400"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-500"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-500"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-4xl">
                  <div className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl">
                    <div className="flex min-h-0 flex-1 flex-col overflow-y-scroll py-6">
                      <div className="px-4 sm:px-6">
                        <div className="flex items-start justify-between">
                          <Dialog.Title className="text-lg font-medium text-gray-900">{roleVerifierToBeEdit ? "Update Role Verifier" : "Create Role Verifier"}</Dialog.Title>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald"
                              onClick={() => setOpen(false)}
                            >
                              <span className="sr-only">Close panel</span>
                              <XIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="relative mt-6 flex-1 px-4 sm:px-6">
                        <div className="flex flex-col gap-y-8">
                          <DiscordRoleSelector selectedRole={selectedRole} setSelectedRole={setSelectedRole} />
                          <LogicSelector
                            basicVerifiersLogic={basicVerifiersLogic}
                            setBasicVerifiersLogic={setBasicVerifiersLogic}
                            title={"Verifier Logic"}
                          />
                          <RoleVerifierCreator
                            basicVerifiers={basicVerifiers}
                            setBasicVerifiers={setBasicVerifiers}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 justify-end px-4 py-4">
                      <button
                        type="button"
                        className="h-12 w-24 rounded-xl border border-gray-300 bg-white py-2 px-4 text-sm font-bold text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald focus:ring-offset-2"
                        onClick={() => {
                          setOpen(false)
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="h-12 w-24 items-center ml-4 inline-flex justify-center rounded-xl border border-transparent bg-emerald py-2 px-4 text-sm font-bold text-black shadow-sm hover:bg-emerald-dark focus:outline-none focus:ring-2 focus:ring-emerald focus:ring-offset-2"
                        onClick={() => {
                          const alertInvalidParams = (detail) => {
                            setShowBasicNotification(true)
                            setBasicNotificationContent({ type: "exclamation", title: "INVALID PARAMS", detail: detail })
                          }

                          const alertEmptyBasicVerifiers = () => {
                            setShowBasicNotification(true)
                            setBasicNotificationContent({ type: "exclamation", title: "EMPTY VERIFIERS", detail: null })
                          }

                          if (!selectedRole) {
                            alertInvalidParams("No Selected Role")
                            return
                          }

                          for (let i = 0; i < basicVerifiers.length; i++) {
                            const bv = basicVerifiers[i]
                            if (!bv.isPreset) {
                              if (!bv.nft) {
                                alertInvalidParams("No Selected NFT")
                                return
                              }
                            }
                            for (let j = 0; j < bv.parameters.length; j++) {
                              const param = bv.parameters[j]
                              if (!param.type.validate(param.value)) {
                                alertInvalidParams()
                                return
                              }
                            }
                          }

                          if (basicVerifiers.length > 0) {
                            if (roleVerifierToBeEdit) {
                              roleVerifierToBeEdit.role = selectedRole
                              roleVerifierToBeEdit.basicVerifiers = basicVerifiers
                              roleVerifierToBeEdit.basicVerifiersLogic = basicVerifiersLogic
                            } else {
                              createNewRoleVerifier(selectedRole, basicVerifiersLogic, basicVerifiers)
                            }
                            setOpen(false)
                          } else {
                            alertEmptyBasicVerifiers()
                          }
                        }}
                      >
                        {roleVerifierToBeEdit ? "Update" : "Save"}
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
