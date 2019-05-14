CREATE TABLE [dbo].[User_Demographic_Data](
	[UserID] [int] NOT NULL,
	[User_Name] [nvarchar](100) NULL,
	[Date_of_Birth] [nvarchar](50) NULL,
	[Gender] [nvarchar](50) NULL,
	[Place_of_Birth] [nvarchar](50) NULL,
	[Ethnicity] [nvarchar](50) NULL,
	[Phone_Number] [nvarchar](50) NULL,
	[Address] [nvarchar](200) NULL,
	[EmailID] [nvarchar](50) NULL,
 CONSTRAINT [PK_User_Demographic_Data] PRIMARY KEY CLUSTERED
(
	[UserID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
