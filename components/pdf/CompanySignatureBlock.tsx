import React from "react"
import { Image, StyleSheet, Text, View } from "@react-pdf/renderer"
import { FEATURES } from "@/lib/features"

type CompanySignatureBlockProps = {
  companyName?: string | null
  /** Kept for future re-enable when FEATURES.companyStampSignature is true. */
  stampUrl?: string | null
  /** Kept for future re-enable when FEATURES.companyStampSignature is true. */
  signatureUrl?: string | null
  /** Show "For, {companyName}" above the signature line. Default true. */
  showForLine?: boolean
  maxWidth?: number
  maxImageHeight?: number
  align?: "center" | "flex-end" | "flex-start"
}

/**
 * Shared signature footer for Invoice and Delivery Challan PDFs.
 * Stamp/signature images are gated by FEATURES.companyStampSignature (currently off).
 */
export function CompanySignatureBlock({
  companyName,
  stampUrl,
  signatureUrl,
  showForLine = true,
  maxWidth = 200,
  maxImageHeight = 80,
  align = "center",
}: CompanySignatureBlockProps) {
  const showImages = FEATURES.companyStampSignature
  const hasStamp = showImages && Boolean(stampUrl?.trim())
  const hasSignature = showImages && Boolean(signatureUrl?.trim())
  const hasImage = hasStamp || hasSignature
  const imageHeight = hasStamp && hasSignature ? Math.min(48, maxImageHeight) : maxImageHeight

  return (
    <View style={[styles.root, { width: maxWidth, alignItems: align }]}>
      {showForLine && companyName ? (
        <Text style={styles.forCompany}>For, {companyName}</Text>
      ) : null}

      {hasImage ? (
        <View style={styles.images}>
          {hasStamp ? (
            <View style={styles.imageBox}>
              {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image */}
              <Image
                src={stampUrl!}
                style={{
                  maxWidth,
                  maxHeight: imageHeight,
                  width: maxWidth,
                  height: imageHeight,
                  objectFit: "contain",
                }}
              />
            </View>
          ) : null}
          {hasSignature ? (
            <View style={styles.imageBox}>
              {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image */}
              <Image
                src={signatureUrl!}
                style={{
                  maxWidth,
                  maxHeight: imageHeight,
                  width: maxWidth,
                  height: imageHeight,
                  objectFit: "contain",
                }}
              />
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={[styles.lineWrap, { width: maxWidth }]}>
        <View style={styles.line} />
        <Text style={styles.signatureLabel}>SIGNATURE</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  forCompany: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 4,
  },
  images: {
    alignItems: "center",
    marginBottom: 4,
  },
  imageBox: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
  },
  lineWrap: {
    alignItems: "center",
  },
  line: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "#000000",
    marginBottom: 3,
  },
  signatureLabel: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
  },
})
