"use client";

import { toast } from "sonner";
import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { UseFormReturn } from "react-hook-form";
import { MapPin, Plus, Trash2 } from "lucide-react";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CalenderBirthDay } from "@/components/ui/calendar-birthday";
import { CalenderValidity } from "@/components/ui/calendar-validity";
import { FileUpload } from "@/components/file-upload";


interface KYCFormFieldsProps {
  form: UseFormReturn<any>;
  currentStep: number;
}

export const KYCFormFields = ({ form, currentStep }: KYCFormFieldsProps) => {
  const t = useTranslations("kycForm");

  const isMoralEntity = form.watch("isMoralEntity");
  const identityDocumentType = form.watch("document.type");

  const [prevType, setPrevType] = useState(identityDocumentType);
  const [prevIsMoral, setPrevIsMoral] = useState(isMoralEntity);

  // Phone 
  const phoneNumbers = form.watch("phoneNumbers") ?? [];

  const addPhoneNumber = React.useCallback(() => {
    const currentPhones = form.getValues("phoneNumbers") ?? [];
    form.setValue("phoneNumbers", [...currentPhones, { number: "", isWhatsapp: false }]);
  }, [form]);

  const removePhoneNumber = (index: number) => {
    const currentPhones = form.getValues("phoneNumbers") ?? [];
    if (currentPhones.length <= 1) {
      toast.error("At least one phone number is required");
      return;
    }
    const newPhones = [...currentPhones];
    newPhones.splice(index, 1);
    form.setValue("phoneNumbers", newPhones);
  };

  // Meter 
  const hasMeterDetails = form.watch("contract.hasMeterDetails");
  const hasOtherContracts = form.watch("otherContracts.hasOtherContracts");
  const otherContractNumbers = form.watch("otherContracts.numbers") ?? [];

  const [prevHasMeterDetails, setPrevHasMeterDetails] = useState(hasMeterDetails);
  const [prevHasOtherContracts, setPrevHasOtherContracts] = useState(hasOtherContracts);

  const addContractNumber = React.useCallback(() => {
    const currentNumbers = form.getValues("otherContracts.numbers") ?? [];
    form.setValue("otherContracts.numbers", [...currentNumbers, ""]);
  }, [form]);

  const removeContractNumber = React.useCallback((index: number) => {
    const currentNumbers = form.getValues("otherContracts.numbers") ?? [];
    const newNumbers = [...currentNumbers];
    newNumbers.splice(index, 1);
    form.setValue("otherContracts.numbers", newNumbers);
  }, [form]);


  useEffect(() => {
    if (prevIsMoral != isMoralEntity) {
      if (isMoralEntity) {
        form.resetField("firstName");
        form.setValue("document.type", "TRADE_REGISTER");
        form.setValue("gender", "company");
      } else {
        form.setValue("document.type", "CNI");
        form.setValue("gender", undefined);
      }
      setPrevIsMoral(isMoralEntity);
    }

    // form.setValue("dateOfBirth", null, { shouldValidate: false, shouldDirty: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMoralEntity]);


  useEffect(() => {
    if (prevType != identityDocumentType) {
      // Réinitialise les champs lorsque le type change
      if (identityDocumentType) {
        // Réinitialiser tous les autres champs
        form.setValue("document.identityDocument.number", "");
        form.resetField("document.identityDocument.postfix.post");
        form.resetField("document.identityDocument.postfix.code");
        form.setValue("document.identityDocument.validityDate", null, { shouldValidate: false, shouldDirty: false });
        // Réinitialiser les erreurs de validation
        form.clearErrors("document.identityDocument.number");
        form.clearErrors("document.identityDocument.postfix");
        form.clearErrors("document.identityDocument.validityDate");

        setPrevType(identityDocumentType);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identityDocumentType]);


  useEffect(() => {
    if (prevHasMeterDetails != hasMeterDetails) {
      if (!hasMeterDetails) {
        form.resetField("contract.meterDetails.number");
        form.resetField("contract.meterDetails.status");
        form.resetField("contract.meterDetails.characteristics");
        form.resetField("contract.meterDetails.type");
        form.resetField("contract.meterDetails.itineraryNumber");
        form.resetField("contract.meterDetails.transformerPower");
        form.resetField("contract.meterDetails.voltage");
      }
      setPrevHasMeterDetails(hasMeterDetails);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMeterDetails]);


  useEffect(() => {
    if (prevHasOtherContracts != hasOtherContracts) {
      if (!hasOtherContracts) {
        form.setValue("otherContracts.numbers", []);
        form.resetField("otherContracts.usageTypes");
        form.resetField("otherContracts.meterDetails");
      }
      setPrevHasOtherContracts(hasOtherContracts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasOtherContracts]);


  const stepComponents = [
    <div
      key={0}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <div className="col-span-full space-y-6">
        <h2 className="text-lg font-semibold">{t("steps.personalInfo")}</h2>
      </div>

      {/* Checkbox for Physical Being or Moral Entity */}
      <FormField
        control={form.control}
        name="isMoralEntity"
        render={({ field }) => (
          <FormItem className="col-span-2 flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel>{t("fields.moralEntity")}</FormLabel>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {isMoralEntity
        ? (<>
          <FormField
            key={'companyName'}
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem className="col-span-2 md:col-span-1">
                <FormLabel>{t("fields.companyName")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("fields.companyNamePlaceholder")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            key={'companyDateOfBirth'}
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem className="col-span-2 md:col-span-1 flex flex-col">
                <FormLabel>{t("fields.companyDateOfBirth")}</FormLabel>
                <CalenderBirthDay
                  key={`companyDateOfBirthCalendar`}
                  date={field.value}
                  setDate={field.onChange}
                  placeholder={t("fields.pickDate")}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </>)
        : (<>
          {/* First Name (only for Physical Being) */}
          <FormField
            key={'firstName'}
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="col-span-2 md:col-span-1">
                <FormLabel>{t("fields.firstName")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("fields.firstNamePlaceholder")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Last Name (only for Physical Being) */}
          <FormField
            key={'lastName'}
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem className="col-span-2 md:col-span-1">
                <FormLabel>{t("fields.lastName")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("fields.lastNamePlaceholder")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Birthday (only for Physical Being) */}
          <FormField
            key={'dateOfBirth'}
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem className="col-span-2 md:col-span-1 flex flex-col">
                <FormLabel>{t("fields.dateOfBirth")}</FormLabel>
                <CalenderBirthDay
                  key={`dateOfBirthCalendar`}
                  date={field.value}
                  setDate={field.onChange}
                  placeholder={t("fields.pickDate")}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Gender (only for Physical Being) */}
          <FormField
            key={'gender'}
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem className="col-span-2 md:col-span-1">
                <FormLabel>{t("fields.gender")}</FormLabel>
                <div style={{ marginTop: "1px" }}>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("fields.selectGender")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">{t("fields.male")}</SelectItem>
                      <SelectItem value="female">{t("fields.female")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

        </>)
      }

    </div>,

    <div
      key={1}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <div className="col-span-full space-y-6">
        <h2 className="text-lg font-semibold">{t("steps.identity")}</h2>
      </div>

      <FormField
        key={"identityDocument.type"}
        control={form.control}
        name="document.type"
        render={({ field }) => (
          <FormItem className="col-span-2 md:col-span-1">
            <FormLabel>{t("fields.identityDocumentType")}</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t("fields.selectDocumentType")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>

                {isMoralEntity
                  ? <SelectItem value="TRADE_REGISTER">{t("fields.TRADE_REGISTER")}</SelectItem>
                  : (
                    <>
                      <SelectItem value="CNI">{t("fields.CNI")}</SelectItem>
                      <SelectItem value="CS">{t("fields.CS")}</SelectItem>
                      <SelectItem value="RECP_CS">{t("fields.RECP_CS")}</SelectItem>
                      <SelectItem value="RECP_CNI">{t("fields.RECP_CNI")}</SelectItem>
                    </>
                  )
                }
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {identityDocumentType == "TRADE_REGISTER"
        ? (<FormField
          control={form.control}
          name="document.identityDocument.number"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>{t("fields.traderegister.label")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("fields.traderegister.placeholder")}
                  {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        )
        : (
          <div className="col-span-2 md:col-span-1 gap-6" key={`identityDocument.postfix.${identityDocumentType}`}>
            <div className="flex flex-col md:flex-row  items-start justify-between space-x-2">
              <FormField
                control={form.control}
                name="document.identityDocument.postfix.post"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>{t("fields.documentPostfix")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("fields.select")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="AD">{t("fields.AD")}</SelectItem>
                        <SelectItem value="CE">{t("fields.CE")}</SelectItem>
                        <SelectItem value="ES">{t("fields.ES")}</SelectItem>
                        <SelectItem value="EN">{t("fields.EN")}</SelectItem>
                        <SelectItem value="LT">{t("fields.LT")}</SelectItem>
                        <SelectItem value="NO">{t("fields.NO")}</SelectItem>
                        <SelectItem value="OU">{t("fields.OU")}</SelectItem>
                        <SelectItem value="SU">{t("fields.SU")}</SelectItem>
                        <SelectItem value="NW">{t("fields.NW")}</SelectItem>
                        <SelectItem value="SW">{t("fields.SW")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="document..identityDocument.postfix.code"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="00"
                        {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="document.identityDocument.number"
              render={({ field }) => (
                <FormItem className="w-full mt-5">
                  <FormLabel>{t("fields.identityDocument.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("fields.identityDocument.placeholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

        )
      }

      <FormField
        control={form.control}
        name="document.identityDocument.validityDate"
        render={({ field }) => (
          <FormItem className="col-span-2 md:col-span-1 flex flex-col">
            <FormLabel>{t("fields.identityDocument.validityDate")}</FormLabel>
            <CalenderValidity
              key={`identityDocument.validityDate.calendar`}
              date={field.value}
              setDate={field.onChange}
              placeholder={t("fields.pickDate")}
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="document.identityDocument.frontImage"
          render={({ field }) => (
            <FormItem >
              <FormLabel>{t("fields.identityDocument.frontfile")}</FormLabel>
              <FormControl>
                <FileUpload
                  onFileSelect={field.onChange}
                  value={field.value}
                  accept={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
                  label={t("fields.identityDocument.frontlabel")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="document.identityDocument.backImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("fields.identityDocument.backfile")}</FormLabel>
              <FormControl>
                <FileUpload
                  onFileSelect={field.onChange}
                  value={field.value}
                  accept={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
                  label={t("fields.identityDocument.backlabel")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Separator className=" col-span-2 w-full" />

      <div className="col-span-full space-y-6">
        <h2 className="text-lg font-semibold">{t("fields.uniqueIdentityNumber")} </h2>
      </div>

      <FormField
        control={form.control}
        name="document.nuiDocument.number"
        render={({ field }) => (
          <FormItem className="col-span-2 md:col-span-1">
            <FormLabel>{t("fields.nuiDocumentNumber")}</FormLabel>
            <FormControl>
              <Input
                placeholder={t("fields.nuiDocumentNumberPlaceholder")}
                {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="document.nuiDocument.file"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("fields.nuiFile")}</FormLabel>
            <FormControl>
              <FileUpload
                onFileSelect={field.onChange}
                value={field.value}
                accept={{ 'image/*': ['.png', '.jpg', '.jpeg'], 'application/pdf': ['.pdf'] }}
                label={t("fields.uploadNuiFile")}
                truncate={false}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

    </div>,

    <div
      key={2}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <div className="col-span-2 md:col-span-full space-y-6">
        <h2 className="text-lg font-semibold">Contact Information</h2>
      </div>

      <div className="col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">Phone Numbers</h3>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={addPhoneNumber}
            className="flex items-center gap-2 bg-[#14689E] hover:bg-[#11567E] text-white"
          >
            <Plus className="h-4 w-4" /> Add Phone Number
          </Button>
        </div>

        {phoneNumbers.map((_: any, index: number) => (
          <div
            key={index}
            className="flex flex-col justify-between gap-2 pt-4 px-4 pb-8 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <FormLabel className="text-sm text-gray-600">Phone Number {index + 1}</FormLabel>

            <div className="flex">
              <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                <FormField
                  control={form.control}
                  name={`phoneNumbers.${index}.number`}
                  render={({ field }: { field: any }) => (
                    <FormItem className="w-full">
                      {/* <FormLabel className="text-sm text-gray-600">Phone Number {index + 1}</FormLabel> */}
                      <FormControl>
                        <Input placeholder="6XXXXXXXX" {...field} className="w-full" />
                      </FormControl>
                      {/* <FormMessage /> */}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`phoneNumbers.${index}.isWhatsapp`}
                  render={({ field }: { field: any }) => (
                    <FormItem className="w-full flex items-center gap-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-[#14689E]"
                        />
                      </FormControl>
                      <FormLabel className="text-sm text-gray-600">
                        This is a WhatsApp number
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removePhoneNumber(index)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 self-center md:self-start"
              >
                <Trash2 className="h-6 w-6" />
              </Button>
            </div>
            {/* Afficher les messages de validation ici */}
            <FormField
              key={index}
              control={form.control}
              name={`phoneNumbers.${index}.number`}
              render={({ field }: { field: any }) => (
                <FormMessage className="text-red-500 text-sm">
                  {(form.formState.errors.phoneNumbers as any)?.[index]?.number?.message}
                </FormMessage>
              )}
            />


          </div>
        ))}
      </div>

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem className="col-span-2 md:col-span-1">
            <FormLabel>Email Address</FormLabel>
            <FormControl>
              <Input type="email" placeholder="your@email.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        key={"location.reference"}
        control={form.control}
        name="location.reference"
        render={({ field }) => (
          <FormItem className="col-span-2 md:col-span-1">
            <FormLabel>Location Reference</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter location reference"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="location.gpsCoordinates"
        render={({ field }) => (
          <FormItem className="col-span-2 md:col-span-1">
            <FormLabel>GPS Coordinates</FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  placeholder="GPS coordinates"
                  {...field}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          const coords = `${position.coords.latitude},${position.coords.longitude}`;
                          field.onChange(coords);
                        },
                        (error) => {
                          toast.error("Failed to get location. Please enter manually.");
                        }
                      );
                    }
                  }}
                >
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>,

    <div
      key={3}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <div className="col-span-full space-y-6">
        <h2 className="text-lg font-semibold">{t("fields.contract.title")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="contract.number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.contract.number.label")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("fields.contract.number.placeholder")}
                    {...field}
                    onBlur={(e) => {
                      field.onBlur();
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contract.status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.contract.status.label")}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("fields.contract.status.placeholder")}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">{t("fields.contract.status.active")}</SelectItem>
                    <SelectItem value="inactive">{t("fields.contract.status.inactive")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contract.customerStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.contract.customerStatus.label")}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("fields.contract.customerStatus.placeholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="landlord">{t("fields.contract.customerStatus.landlord")}</SelectItem>
                    <SelectItem value="tenant">{t("fields.contract.customerStatus.tenant")}</SelectItem>
                    <SelectItem value="other">{t("fields.contract.customerStatus.other")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contract.usageType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.contract.usageType.label")}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("fields.contract.usageType.placeholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="residential">{t("fields.contract.usageType.residential")}</SelectItem>
                    <SelectItem value="commercial">{t("fields.contract.usageType.commercial")}</SelectItem>
                    <SelectItem value="other">{t("fields.contract.usageType.other")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>


        <FormField
          key="contract.activity"
          control={form.control}
          name="contract.activity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("fields.contract.activity.label")}</FormLabel>
              <FormControl>
                {/* <Input
                  placeholder={t("fields.contract.activity.placeholder")}
                  {...field} /> */}
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("fields.contract.activity.placeholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Dwelling House">{t("fields.contract.activity.dwelling_house")}</SelectItem>
                    <SelectItem value="Breeding, Hunting, Trapping">{t("fields.contract.activity.breeding_hunting_trapping")}</SelectItem>
                    <SelectItem value="Sylviculture and Forestry Development">{t("fields.contract.activity.sylviculture_and_forestry_development")}</SelectItem>
                    <SelectItem value="Work of Grain">{t("fields.contract.activity.work_of_grain")}</SelectItem>
                    <SelectItem value="Manufacture but Agricultural Products">{t("fields.contract.activity.manufacture_but_agricultural_products")}</SelectItem>
                    <SelectItem value="Oilseeds and Feeding Stuffs Industry">{t("fields.contract.activity.oilseeds_and_feeding_stuffs_industry")}</SelectItem>
                    <SelectItem value="Manufacture of Cereal Products">{t("fields.contract.activity.manufacture_of_cereal_products")}</SelectItem>
                    <SelectItem value="Milk, Fruits and Other Foodstuffs Industry">{t("fields.contract.activity.milk_fruits_and_other_foodstuffs_industry")}</SelectItem>
                    <SelectItem value="Drinks industry">{t("fields.contract.activity.drinks_industry")}</SelectItem>
                    <SelectItem value="Industry of Tobacco">{t("fields.contract.activity.industry_of_tobaco")}</SelectItem>
                    <SelectItem value="Textile and the Sewing Industry">{t("fields.contract.activity.textile_and_the_sewing_industry")}</SelectItem>
                    <SelectItem value="Shoes and Leather Industry">{t("fields.contract.activity.shoes_and_leather_industry")}</SelectItem>
                    <SelectItem value="Wood Industry Except Furniture Manufactures">{t("fields.contract.activity.wood_industry_except_furniture_manufactures")}</SelectItem>
                    <SelectItem value="Manufacture of Paper and Paper Articles">{t("fields.contract.activity.manufacture_of_paper_and_paper_articles")}</SelectItem>
                    <SelectItem value="Oil Refining, Coking and Transformation">{t("fields.contract.activity.oil_refining_coking_and_transformation")}</SelectItem>
                    <SelectItem value="Chemical Industry">{t("fields.contract.activity.chemical_industry")}</SelectItem>
                    <SelectItem value="Rubber Industry">{t("fields.contract.activity.rubber_industry")}</SelectItem>
                    <SelectItem value="Manufacture of other nonmetal mineral products">{t("fields.contract.activity.manufacture_of_other_nonmetal_mineral_products")}</SelectItem>
                    <SelectItem value="Manufacture of Mechanical equipments">{t("fields.contract.activity.manufacture_of_mechanical_equipments")}</SelectItem>
                    <SelectItem value="Manufacture of machines, electrical appliances">{t("fields.contract.activity.manufacture_of_machines_electrical_appliances")}</SelectItem>
                    <SelectItem value="Clock Industry">{t("fields.contract.activity.clock_industry")}</SelectItem>
                    <SelectItem value="Manufacture of Transport Equipments">{t("fields.contract.activity.manufacture_of_transport_equipments")}</SelectItem>
                    <SelectItem value="Manufacture of Furniture, NCA Manufacture activity">{t("fields.contract.activity.manufacture_of_furniture_nca_manufacture_activity")}</SelectItem>
                    <SelectItem value="Generation and Distribution of Water and Gas">{t("fields.contract.activity.generation_and_distribution_of_water_and_gas")}</SelectItem>
                    <SelectItem value="Building and Public Works">{t("fields.contract.activity.building_and_public_works")}</SelectItem>
                    <SelectItem value="Wholesale and Retail">{t("fields.contract.activity.wholesale_and_retail")}</SelectItem>
                    <SelectItem value="Repairs Activity">{t("fields.contract.activity.repairs_activity")}</SelectItem>
                    <SelectItem value="Restaurants and Hotels">{t("fields.contract.activity.restaurants_and_hotels")}</SelectItem>
                    <SelectItem value="Transport, Warehouses and Communication">{t("fields.contract.activity.transport_warehouses_and_communication")}</SelectItem>
                    <SelectItem value="Posts and Telecommunications">{t("fields.contract.activity.posts_and_telecommunications")}</SelectItem>
                    <SelectItem value="Financial Intermediation and Activities">{t("fields.contract.activity.financial_intermediation_and_activities")}</SelectItem>
                    <SelectItem value="Rent Activities">{t("fields.contract.activity.rent_activities")}</SelectItem>
                    <SelectItem value="Services Activities to Companies">{t("fields.contract.activity.services_activities_to_companies")}</SelectItem>
                    <SelectItem value="Social Security">{t("fields.contract.activity.social_security")}</SelectItem>
                    <SelectItem value="Education">{t("fields.contract.activity.education")}</SelectItem>
                    <SelectItem value="Social Health and Action">{t("fields.contract.activity.social_health_and_action")}</SelectItem>
                    <SelectItem value="Other Activities Provided to the Community">{t("fields.contract.activity.other_activities_provided_to_the_community")}</SelectItem>
                    <SelectItem value="International Organizations">{t("fields.contract.activity.international_organizations")}</SelectItem>
                    <SelectItem value="Mixed Activities">{t("fields.contract.activity.mixed_activities")}</SelectItem>
                    <SelectItem value="Presidency and Attached Services, Administration">{t("fields.contract.activity.presidency_and_attached_services_administration")}</SelectItem>
                    <SelectItem value="Communities Offices">{t("fields.contract.activity.communities_offices")}</SelectItem>
                    <SelectItem value="Street Lighting">{t("fields.contract.activity.street_lighting")}</SelectItem>
                    <SelectItem value="Aes Sonel Services">{t("fields.contract.activity.aes_sonel_services")}</SelectItem>
                    <SelectItem value="SNEC Services">{t("fields.contract.activity.snec_services")}</SelectItem>
                    <SelectItem value="Utilities Companies - Preferential Mode">{t("fields.contract.activity.utilities_companies_preferential_mode")}</SelectItem>
                    <SelectItem value="Utilities Companies - Free Mode">{t("fields.contract.activity.utilities_companies_free_mode")}</SelectItem>
                    <SelectItem value="Other">{t("fields.contract.activity.other")}</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <h2 className="text-lg font-semibold pt-6">{t("fields.contract.meterDetails.title")}</h2>

        <FormField
          control={form.control}
          name="contract.hasMeterDetails"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>{t("fields.contract.meterDetails.toggle")}</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        {hasMeterDetails
          &&
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="contract.meterDetails.number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.contract.meterDetails.number.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("fields.contract.meterDetails.number.placeholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contract.meterDetails.status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.contract.status.label")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("fields.contract.status.placeholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">{t("fields.contract.status.active")}</SelectItem>
                      <SelectItem value="inactive">{t("fields.contract.status.inactive")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contract.meterDetails.characteristics"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.contract.meterDetails.characteristics.label")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("fields.contract.meterDetails.characteristics.placeholder")}
                      {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contract.meterDetails.type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.contract.meterDetails.type.label")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("fields.contract.meterDetails.type.placeholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="prepaid">Prepaid</SelectItem>
                      <SelectItem value="postpaid">Postpaid</SelectItem>
                      <SelectItem value="smart">Smart Meter</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contract.meterDetails.itineraryNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.contract.meterDetails.itineraryNumber.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("fields.contract.meterDetails.itineraryNumber.placeholder")}
                      {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contract.meterDetails.transformerPower"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("fields.contract.meterDetails.transformerPower.label")}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={t("fields.contract.meterDetails.transformerPower.placeholder")}
                      {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contract.meterDetails.voltage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.contract.meterDetails.voltage.label")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("fields.contract.meterDetails.voltage.placeholder")}
                      {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        }

        <h2 className="text-lg font-semibold pt-6">{t("fields.contract.otherContracts.title")}</h2>

        <FormField
          control={form.control}
          name="otherContracts.hasOtherContracts"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>{t("fields.contract.otherContracts.toggle")}</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {hasOtherContracts && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Other Contract Numbers</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addContractNumber}
                className="flex items-center gap-1 text-[#14689E] border-[#14689E] hover:bg-[#14689E] hover:text-white"
              >
                <Plus className="h-4 w-4" />{t("fields.contract.otherContracts.add")}
              </Button>
            </div>

            {otherContractNumbers.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("fields.contract.otherContracts.empty")}</p>
            )}

            {otherContractNumbers.map((_: string, index: number) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  {/* Champ pour le numéro de contrat */}
                  <FormField
                    control={form.control}
                    name={`otherContracts.numbers.${index}`}
                    render={({ field }: { field: any }) => (
                      <FormItem className="w-full">
                        <FormLabel className="text-sm text-gray-600">{t("fields.contract.otherContracts.numberLabel")} {index + 1}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("fields.contract.number.placeholder")}
                            className="w-full"
                            {...field}
                            onBlur={(e) => {
                              field.onBlur();
                            }}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm" />
                      </FormItem>
                    )}
                  />

                  {/* Bouton de suppression */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeContractNumber(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-2 md:mt-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Champs liés pour "Type of Usage" et "Meter Details" */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Meter Number */}
                  <FormField
                    control={form.control}
                    name={`otherContracts.meterDetails.${index}.number`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm text-gray-600">{t("fields.contract.otherContracts.meterNumber")} {index + 1}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("fields.contract.meterDetails.number.placeholder")}
                            {...field}
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm" />
                      </FormItem>
                    )}
                  />

                  {/* Type of Usage */}
                  <FormField
                    control={form.control}
                    name={`otherContracts.usageTypes.${index}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm text-gray-600">{t("fields.contract.otherContracts.usageType")} {index + 1}</FormLabel>
                        <Select onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select usage type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="residential">Residential</SelectItem>
                            <SelectItem value="commercial">Commercial</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-500 text-sm" />
                      </FormItem>
                    )}
                  />


                </div>

                {/* Autres champs liés (optionnels) */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Itinerary Number */}
                  <FormField
                    control={form.control}
                    name={`otherContracts.meterDetails.${index}.itineraryNumber`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm text-gray-600">Itinerary Number {index + 1}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter itinerary number"
                            {...field}
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm" />
                      </FormItem>
                    )}
                  />

                  {/* Transformer Power */}
                  <FormField
                    control={form.control}
                    name={`otherContracts.meterDetails.${index}.transformerPower`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm text-gray-600">Transformer Power {index + 1}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter transformer power"
                            {...field}
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  ];

  const CurrentStep = stepComponents[currentStep];

  return (
    <div>
      {CurrentStep}
    </div>
  );
};
