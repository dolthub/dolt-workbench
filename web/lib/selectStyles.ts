import { OptionTypeBase } from "@components/FormSelect/types";
import { StylesConfig } from "react-select";
import tailwindColors from "tailwindcss/colors";
import { colors } from "./tailwind";

export default function customStyles<
  Q extends OptionTypeBase,
  IsMulti extends boolean = false,
>(
  mono?: boolean,
  light?: boolean,
  small?: boolean,
  pill?: boolean,
  transparentBorder?: boolean,
): Partial<StylesConfig<Q, IsMulti>> {
  const getColor = (isFocused: boolean) =>
    isFocused ? tailwindColors.gray["400"] : tailwindColors.gray["300"];

  return {
    placeholder: styles => {
      return {
        ...styles,
        color: tailwindColors.gray["400"],
        textTransform: "lowercase",
        fontSize: getFontSize(small, mono),
        fontFamily: getFontFamily(mono),
        fontWeight: 400,
      };
    },
    control: (styles, { isFocused }) => {
      return {
        ...styles,
        backgroundColor: isFocused || light ? "white" : colors["ld-lightblue"],
        borderRadius: pill ? "9999px" : "4px",
        width: transparentBorder ? "10rem" : "",
        borderColor: transparentBorder ? "transparent" : getColor(isFocused),
        boxShadow: "none",
        maxHeight: small ? "30px" : styles.maxHeight,
        minHeight: small ? "30px" : styles.minHeight,
        fontSize: getFontSize(small, mono),
        fontFamily: getFontFamily(mono),
        "&:hover": {
          borderColor: transparentBorder
            ? "transparent"
            : tailwindColors.gray["400"],
        },
      };
    },
    dropdownIndicator: styles => {
      return {
        ...styles,
        color: colors.primary,
        paddingTop: small ? "3px" : styles.paddingTop,
      };
    },
    indicatorSeparator: styles => {
      return {
        ...styles,
        marginBottom: small ? "4px" : styles.marginBottom,
        marginTop: small ? "4px" : styles.marginTop,
      };
    },
    indicatorsContainer: styles => {
      return {
        ...styles,
        height: small ? "28px" : styles.height,
      };
    },
    input: styles => {
      return {
        ...styles,
        color: colors.primary,
        fontSize: getFontSize(small, mono),
        fontFamily: getFontFamily(mono),
      };
    },
    option: (styles, { isFocused, isSelected, isDisabled }) => {
      return {
        ...styles,
        display: "flex",
        alignItems: "center",
        color: isDisabled ? tailwindColors.gray["400"] : colors.primary,
        backgroundColor:
          isFocused || isSelected ? colors["ld-lightpurple"] : undefined,
        fontFamily: getFontFamily(mono),
        fontSize: getFontSize(small, mono),
      };
    },
    singleValue: styles => {
      return {
        ...styles,
        color: colors.primary,
        fontFamily: getFontFamily(mono),
        fontSize: getFontSize(small, mono),
        top: small ? "45%" : styles.top,
      };
    },
    menu: styles => {
      return {
        ...styles,
        color: colors.primary,
        fontFamily: getFontFamily(mono),
        fontSize: getFontSize(small, mono),
      };
    },
  };
}

function getFontSize(small?: boolean, mono?: boolean): string {
  if (mono) return "11px";
  return small ? "12px" : "14px";
}

function getFontFamily(mono?: boolean): string {
  return mono
    ? "Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace"
    : "Source Sans Pro";
}
