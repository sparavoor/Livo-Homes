export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  material: string;
  image: string;
  description: string;
  isNew?: boolean;
  isBestseller?: boolean;
}

export interface CategoryDetail {
  id: string;
  name: string;
  image: string;
  description: string;
  count: number;
}

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Helios Matte Faucet",
    category: "Designer Faucets",
    price: 720,
    oldPrice: 840,
    material: "Matte Black",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAONWuwQJOJYTNyMAB0VKqZiYXywkdFr21UjZGIzqMAy14d6wTdFebkUgClt1vv2GVcxbmayWsExvFzZOQfU3Lgdbr6flJcpIWRTpdBL5FIX1b1YFsnBqGYaEMh-w7LoE4xecOZAnafweBlkf0RGsN6ELfyZGbOasZWIo0-usrH29do0APVUVcyxP95xaYOLj79rDMRS8IlrhHgKS0khckun8ly-0okcucfDYCuX7lmfnVm6LdV5Y_I-80frukRGoW00oKDc4rphFU",
    description: "Architectural precision crafted from solid lead-free brass with a signature obsidian finish.",
    isNew: true
  },
  {
    id: 2,
    name: "Zenith Vessel Basin",
    category: "Wash Basins",
    price: 1250,
    material: "White Porcelain",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDvoLlh8-dlcA9l4fSwedEIkbBb97KDRN7NpPl_KnjHcgu5Rr1cna8bXiE-lpi9sIAJ_ULJ3Mby2UgPUXILHU8D6svI1xWNKFSBHnwNAJWgz_dceWdgHnGN2xXubrNg7vOxHG1s3G3sFYwmcuFvyJe58_YdODnWd3_OjnYMRhUf5AyFwd0B2_mAfaQI4gxd-22D4EpPXpkEm4lsOxEvmVLlWNOPHRsWpfIIKR0qwRAcK4nkIqgVytwTfseHEMGJuuqqx6zfvPr8cu8",
    description: "High-glaze fireclay sculpted into an ultra-slim profile for the contemporary vanity."
  },
  {
    id: 3,
    name: "Rainfall Elite System",
    category: "Luxury Showers",
    price: 1850,
    oldPrice: 2100,
    material: "Polished Chrome",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCcUFnXA_UK7-IRBApNbHurSSVA3DzUkXOnYOCibjJTZgjVM76qGwnM8ccuuYGOko_DYxKLs8ZCObFOHoumwmUNSOx3huZQ0r7K9maykGhcDvw0JZlTx9a4E76enc5o8H-872YwSQZNQ6Q_QqQunfSW_dbIioukNabp3Y9TsFa1Z1TpyOimJEfYNSo0sdQEz77DKeGcaopJy5jr1lDer_Cd6j3NxhICdbjgB0FN9IRu8g2oCCw-nOiiBF7iujsRF91Nh0NBu0CODjQ",
    description: "Integrated thermostatic control with a wide-span overhead rain experience.",
    isBestseller: true
  },
  {
    id: 4,
    name: "Nexus Intelligent Closet",
    category: "Closet Systems",
    price: 3400,
    material: "White Porcelain",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAGc7DJ8Pq1ewGno-f7bMu8aqUpwySgr2szmBKvYYTWsfL9kHzJ--kf2aR8BaQS5oeYgBi8u9rquqNDcTieRgeG3T7CDL_djxPgSWEdFnZNnWcyBMqN8TlsOHxRURtH3XL2xCoOgaczDKdguEtHL4hqhZTlH6NFkwchqvKrXQqqosR5AaVyw8FMPD-TByvFlD6A6SKeT8kHtXt2jXCTTLPahPJzk1Kd0fBsQ6HG7MJ8Qi5O8OPgTrvEW30mK6agkQU7BAx9H-CrPoQ",
    description: "Fully automated rimless design with warm-air dryer and integrated bidet functionality."
  },
  {
    id: 5,
    name: "Industrial Knurled Pulls",
    category: "Cabinet Hardware",
    price: 45,
    material: "Solid Brass",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAkzjCA_ntPfb6Dy35PGIlwZOivLHFAwHGwFY3vWnSXUHA_Tttq2ttekjfh2IT_ThQUnqBdnNv8Y-vepS8znaRvPc71fuWR0VBEQD76DgJFpb6QwqNWrFUDcp3Puq6ecGnBdIStTgvv5WIvKbOTPB8uc1G_NOiAkVMq-7Ok836-IF6aqwcLojPpdcocQfealNsUg7OHf7lsCNcdP4ps15wsQZk3Cia1TSuswCmHOk1NS3__ImDE7mNHBrxe235ZNg7Rx4uzjJug7GA",
    description: "Solid machined brass with cross-knurl texture for superior tactile feedback and grip."
  },
  {
    id: 6,
    name: "Pro-Series Smart Oven",
    category: "Cabinet Hardware",
    price: 3800,
    oldPrice: 4200,
    material: "Matte Black",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD6OK9kg-gqN_czA-dWhqpyKZtkDoI75qR40KaH6UKW_-NtuIU9cfR0aQ2Ym2Xo7eVte2rymRLXelWyzU2Otm5bnu2Qqp4A4t0NR7Hvsba7ctMRsUkXg_qkjOiPFzaVIjcv8zHP7FxqJVx0a_SfF8NKyBjPEbReJ76Wchajg41p6Yt3eF5XuCNBzTIUnU0iTUKgnUgm7-oes1CWprWg0C_0XT9K0OAe6dZXVvPJPC-m4mYkpcJ97b2OmROmGkxs4l3go-NOZn5jn7U",
    description: "Full-surface induction with TFT touch display and precision heat management technology."
  }
];

export const CATEGORY_DETAILS: CategoryDetail[] = [
  {
    id: "closets",
    name: "Closets",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA_4ZMJCqcdzRVjSR4oPbc3i63TZo3gx6su1UwFLcGZDdKLqP7uWAIaLZIGQQJxsobdgJcWQEU6KbXUoR2AoO6zbvhXWHFNp3OQ688ztYhVVB7do0FXRmJAXyRqsqbXiLoqofXKlLczkvQEngZoNN3uYj33xMocBtcqzx5kK7-a1ztw7FlikDrC4gwpJv4gd6ksXyZseuM2nTmmGTklLvB93llNAnQPZNoYBMAtBTo8qmXC25_z3n6yu64z3V8xwqcNQomDHXU4akg",
    description: "Bespoke storage solutions and architectural wardrobes.",
    count: 24
  },
  {
    id: "wash-basin",
    name: "Wash Basin",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDr6QBCGNhUxCejzeGst8Q5Dcl4YJhR5dsHmWbnrhmilEyEGRJAgD9uVxZvL7u060-RwItPvgzaa5dlq2Fijg4dIADjpR980NlGlMTQkWI4NCpmnloJQFb16BHxVJ3D49Ru-MA42Zdsz3ApaJwrDeWZ7AZ4t8bfwVt6hr6FGc0HW1qP3bCZAIYd7rjNaYpEYUYUdQwHOxiquCfx5o_If5rzMHDDdyUZAIgWH6e8hFtCePCrYwoZz_5ywEWiXEN5NJDGucctO1Z_MOM",
    description: "Sculpted vessels and monolith basins for modern vanities.",
    count: 18
  },
  {
    id: "faucets",
    name: "Faucets",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDr8ZOGbykKA1ujwtaeS6CUtgyu6kTFYTd06L29-pzP2Co2-lTDsGyTULuZWAegaLIbWdLbr4a0is1Yz2Z2wT3zpsjYxxGK46_-htPC6f3wCE_RO8TiAOpgWEYBbgXATkXBnRWutVnbFUO9GQbV4bAAGltMUJpm7Pz81dQnYZWuwixaWttosdtvs_mnEryZMUXIOI7vsGvESNUZ5pD50-B7-T9hOX3jt1fVMltWuE4IewQqNMfgYcxd3adjq2mna3yF86NykP6IcLo",
    description: "Precision-engineered flow control in architectural finishes.",
    count: 52
  },
  {
    id: "shower",
    name: "Shower",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB6nrevQJS1XlMiEd8Svq-rT7cyz9TWjEoDefJiTMRM7Y2UMVOVFAlMxfQz7vSQQqUyR0z9Cpv8K1Pfy-KsDPHk0eOfdwMsUXUQ3a84Uv87k5yFVKYLKPRR5_hPwZsjupsS2A5jx7CwZ5jH7PQiccUB6rNuT9ljV85ixf5E85k2sOvhuvZZ3frpULCWcatCEL_KRCrRwK3mpJLBXznrvNeM8H78ea2FMT1LP4tFioT-tbosQ7mY4IkbOGx8QURBC7kXhIg1aMsutbo",
    description: "Immersive hydrotherapy systems with thermostatic control.",
    count: 12
  },
  {
    id: "accessories",
    name: "Accessories",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAbEt9CFYBk5jAqIp-jhyC0bAA6zeuVryF_PePBtqo6pNC7-74OBjOS663wa-w2fBqS5aEktj37FJKxHN1wU9hWmy5PSGkw9_Q_goTuVmnISfRaSwUsbFPb6MBibqMKjeYG_0SjbC1GoXHyGwm_v9_OWSctopC98xqBJtiOdK74--xMuv-W8hvwayN8lAtY0jSSuPQDK-iqJGiHSMnU4JxTqyq6YPMR9Xn9d94bLmIXkTy7LFPuT9fDtauseEVBEJUANzSRcxDw5J0",
    description: "Premium bathroom hardware and designer accessories.",
    count: 88
  },
  {
    id: "kitchen-sink",
    name: "Kitchen Sink",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBW8AwD5EQddoeRXDh5wGW5MdZfRGRmM3MAl0Bl00Rz-gSkTFdyB05SxcrKcYQNTfJTSEN0sXeIIMIYQO_iaPWzdYtfJDZ7rTN0K4Wl8u8Osaf2O43X17EplVB4zthP9vJ6BHlcx_6eMQElwm7uaIX2gtYhXBtQYoM5Jvwhdhagms4z4QPgbmEW6nckjIRMtAljftIG-oxLnhZHM8yc5tzYo-CIqcxS1UTeskEhHfpSBIrubiMJwc0aUsRRa16WDAYZCGclHLMJ_PM",
    description: "Stainless steel and composite sinks for modern kitchens.",
    count: 31
  },
  {
    id: "electrical",
    name: "Electrical",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCRdVTKQYb-tEHHEl87mdV8HuOtoFSeHy_t6sImRR2couuowXiQC75I4p-7M_7VMM5UPEXWk-gY1EkAFcj48xhVBJpHyhDDWV9d8gXZQqq0xv4SCX_X7Y0mBZl-8xQBgVqt96JOm48fkp_aJcnk7dxAujvvNKMQKC-55Cc5R18pDBvpoFyN05hYbkEXBuK6KctCFvkZ93m98psWByzWDvcSX4g_vq50JlSREygpFs8cxUzPWq8a08FddIg0BZhRg8Pip53s0iJWMbo",
    description: "Modern switches, sockets, and smart home modules.",
    count: 156
  },
  {
    id: "drainers",
    name: "Drainers",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBVWuVIGYRXcvT5XuXHC4qOFX44-VATw9Fa5NLBP78yewG_rBJf7SFFU0_whpf9FFzjblC9UPIWn2RIH0E5NQsVkRAt1uqrfaQT-4ge8cN5myevZBlF_Dvy7vkEob9UKOaBlbEMELxgKHJ0-gqGD3iKHx3b8skGpX1ZPMbk8iL0OdepHJkH2ljTUQAQulc31POvULW1gDfqdDS3zxyN7tyxh4QBNcmJoFW0gmHXMRMNUNetfAeR4EmJDCZ9mRke4c6cpp30J51vJSk",
    description: "Architectural floor drains and decorative gratings.",
    count: 14
  },
  {
    id: "ptmt",
    name: "PTMT",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCJiRskQ0XY9BQ36pBRlIUvtfQgjFahERuTzXRgrLAfsJ8eiQy6FDwUada8Br2T3MoMjF4751f3-rc_THMkzpYY0iT1rCiloC7fGsR1ywBgV0Ui75IzsUujSohcJIuK5Q7xi2ag8mEy4MIUNr8y5-X0x1dguNqkkvG0eXB46n_wH5ozPGENo5OiuWdzEJ-UnAVRFwONZAEjk_AEgP7buC6GlIrhD1MrwiSiaRnRL5EiYK9bcYr7zqZ1HdB3oZXCNOJBT-oBOpsBvqs",
    description: "Durable PTMT fittings for high-utility areas.",
    count: 42
  },
  {
    id: "flushing",
    name: "Flushing",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAAkIfRIl3IS9b-jHR6gg1KcL-LlFLHSH5Z05luw7h0E5Zyc5Qeg6Xp5IjJE06N_oU4q_q1cPLuTVP8XzDrE8EL-55KalUxBvPdoPbZTcKULwQfvVeQiqsEl5_fdz3cpi-kGXovuBTQNZr2pnS01QkLYbC9bcKs5ZMrOrWywQaURkuixkoHlzLcJFwjbibuPM9THT4lXnr5zLzpg7mmNyY5V6YbD2HL1lJDfWP58I7lQqPAQh3g2LPLn08mhyw3VmZ5Ke6eFvcHXdc",
    description: "Concealed cisterns and elegant flushing mechanisms.",
    count: 8
  },
  {
    id: "smart-mirrors",
    name: "Smart Mirrors",
    description: "Intelligent mirrors with integrated lighting and anti-fog technology.",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop",
    count: 0
  }
];

export const MATERIALS = [
  "Brushed Gold",
  "Matte Black",
  "Polished Chrome",
  "Solid Brass",
  "White Porcelain"
];
