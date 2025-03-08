"use client";

import React, { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { format } from "date-fns";
import { toast } from "sonner";
import { Calendar as CalendarIcon, MapPin, Plus, Trash2, FileText } from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { cn } from "@/lib/utils";
import { FileUpload } from "./file-upload";
import { useTranslations } from "next-intl";


interface KYCFormFieldsProps {
  form: UseFormReturn<any>;
  currentStep: number;
}

const KYCFormFieldsComponent = ({ form, currentStep }: KYCFormFieldsProps) => {
  
  const t = useTranslations("kycForm");

  const hasOtherContracts = form.watch("otherContracts.hasOther");
  const otherContractNumbers = form.watch("otherContracts.numbers") || [];
  const phoneNumbers = form.watch("phoneNumbers") || [];
  const isMoralEntity = form.watch("isMoralEntity"); // Checkbox value

  useEffect(() => {
    console.log("Component re-rendered");
  });

  useEffect(() => {
    if (isMoralEntity) {
      form.setValue("gender", "company");
      form.setValue("firstName", " ");
    } else {
      form.setValue("gender", "");
      form.setValue("firstName", "");
    }
  }, [isMoralEntity]);

  const addContractNumber = React.useCallback(() => {
    const currentNumbers = form.getValues("otherContracts.numbers") || [];
    form.setValue("otherContracts.numbers", [...currentNumbers, ""]);
  }, [form]);

  const removeContractNumber = React.useCallback((index: number) => {
    const currentNumbers = form.getValues("otherContracts.numbers") || [];
    const newNumbers = [...currentNumbers];
    newNumbers.splice(index, 1);
    form.setValue("otherContracts.numbers", newNumbers);
  }, [form]);

  const addPhoneNumber = React.useCallback(() => {
    const currentPhones = form.getValues("phoneNumbers") || [];
    form.setValue("phoneNumbers", [...currentPhones, { number: "", isWhatsapp: false }]);
  }, [form]);

  const removePhoneNumber = (index: number) => {
    const currentPhones = form.getValues("phoneNumbers") || [];
    if (currentPhones.length <= 1) {
      toast.error("At least one phone number is required");
      return;
    }
    const newPhones = [...currentPhones];
    newPhones.splice(index, 1);
    form.setValue("phoneNumbers", newPhones);
  };


  const PersonalInfoFields = () => (
    <>
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


      {/* First Name (only for Physical Being) */}
      {!isMoralEntity && (
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("fields.firstName")}</FormLabel>
              <FormControl>
                <Input placeholder={t("fields.firstNamePlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}


      {/* Last Name or Company Name */}
      <FormField
        control={form.control}
        name="lastName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{isMoralEntity ? t("fields.companyName") : t("fields.lastName")}</FormLabel>
            <FormControl>
              <Input
                placeholder={isMoralEntity ? t("fields.companyNamePlaceholder") : t("fields.lastNamePlaceholder")}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Birthday */}
      <FormField
        control={form.control}
        name="dateOfBirth"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>{t("fields.dateOfBirth")}</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PPP")
                    ) : (
                      <span>{t("fields.pickDate")}</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Gender (only for Physical Being) */}
      {!isMoralEntity && (
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
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
      )}

    </>
  );

  const IdentityFields = () => (
    <>
      <div className="col-span-full space-y-6">
        <h2 className="text-lg font-semibold">{t("fields.identity")}</h2>
      </div>

      <FormField
        control={form.control}
        name="identityDocument.type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("fields.identityDocumentType")}</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t("fields.selectDocumentType")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="CNI">{t("fields.CNI")}</SelectItem>
                <SelectItem value="CS">{t("fields.CS")}</SelectItem>
                <SelectItem value="RECP_CS">{t("fields.RECP_CS")}</SelectItem>
                <SelectItem value="RECP_CNI">{t("fields.RECP_CNI")}</SelectItem>
                <SelectItem value="TRADE_REGISTER">{t("fields.TRADE_REGISTER")}</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex items-start justify-between space-x-2">
        <FormField
          control={form.control}
          name="identityDocument.postfix"
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
          name="identityDocument.number"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Document Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter document number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="identityDocument.validityDate"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Document Validity Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="identityDocument.frontImage"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>ID Front Image</FormLabel>
              <FormControl>
                <FileUpload
                  onFileSelect={onChange}
                  accept={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
                  label="Upload ID front image"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="identityDocument.backImage"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>ID Back Image</FormLabel>
              <FormControl>
                <FileUpload
                  onFileSelect={onChange}
                  accept={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
                  label="Upload ID back image"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Separator className=" col-span-2 w-full" />

      <div className="col-span-full space-y-6">
        <h2 className="text-lg font-semibold">Unique Identity Number (NIU) </h2>
      </div>

      <FormField
        control={form.control}
        name="nuiDocument.number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>NUI Document Number</FormLabel>
            <FormControl>
              <Input placeholder="Enter NUI document number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="nuiDocument.file"
        render={({ field: { onChange, value, ...field } }) => (
          <FormItem>
            <FormLabel>NUI file</FormLabel>
            <FormControl>
              <FileUpload
                onFileSelect={onChange}
                accept={{ 'image/*': ['.png', '.jpg', '.jpeg'], 'application/pdf': ['.pdf'] }}
                label="Upload ID front image or PDF"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />



    </>
  );

  const ContactFields = () => (
    <>
      <div className="col-span-full space-y-6">
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
          <div key={index} className="flex flex-col justify-between gap-2 pt-4 px-4 pb-8 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
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
          <FormItem>
            <FormLabel>Email Address</FormLabel>
            <FormControl>
              <Input type="email" placeholder="your@email.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="location.reference"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location Reference</FormLabel>
            <FormControl>
              <Input placeholder="Enter location reference" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="location.gpsCoordinates"
        render={({ field }) => (
          <FormItem>
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
    </>
  );

  const MeterFields = () => {

    return (
      <>
        <div className="col-span-full space-y-6">
          <h2 className="text-lg font-semibold">Contract Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="contract.number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter 10-digit contract number" {...field} />
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
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
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
                  <FormLabel>Customer Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="landlord">Landlord</SelectItem>
                      <SelectItem value="tenant">Tenant</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
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
                  <FormLabel>Type of Usage</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select usage type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>


          <FormField
            control={form.control}
            name="contract.activity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Activity</FormLabel>
                <FormControl>
                  <Input placeholder="Enter activity" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <h2 className="text-lg font-semibold pt-6">Meter Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="contract.meterDetails.number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meter Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter meter number" {...field} />
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
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
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
                  <FormLabel>Meter Characteristics</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter meter characteristics" {...field} />
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
                  <FormLabel>Meter Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select meter type" />
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
                  <FormLabel>Itinerary Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter itinerary number" {...field} />
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
                  <FormLabel>Transformer Power</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter transformer power" {...field} />
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
                  <FormLabel>Voltage</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter voltage" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


          </div>


          <FormField
            control={form.control}
            name="otherContracts.hasOther"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Have Other Contracts?</FormLabel>
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
                  <Plus className="h-4 w-4" /> Add Contract
                </Button>
              </div>

              {otherContractNumbers.length === 0 && (
                <p className="text-sm text-muted-foreground">No other contracts added yet.</p>
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
                          <FormLabel className="text-sm text-gray-600">Contract Number {index + 1}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter 10-digit contract number"
                              {...field}
                              className="w-full"
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
                          <FormLabel className="text-sm text-gray-600">Meter Number {index + 1}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter meter number"
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
                      name={`otherContracts.usageType.${index}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-gray-600">Type of Usage {index + 1}</FormLabel>
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
      </>
    )
  };

  const stepComponents = [
    PersonalInfoFields,
    IdentityFields,
    ContactFields,
    MeterFields,
  ];

  const CurrentStep = stepComponents[currentStep];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <CurrentStep />
    </div>
  );
};

export const KYCFormFields = KYCFormFieldsComponent;
KYCFormFieldsComponent.displayName = "KYCFormFieldsComponent";


