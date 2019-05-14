USE GANADB;
GO
BULK INSERT [dbo].[User_Demographic_Data] FROM 'E:\GANA\Gana PoC 2 - NodeJS + SQL Server\UserDemographicData.csv'
   WITH (
      FIELDTERMINATOR = ',',
      ROWTERMINATOR = '\n'
);
GO

select * from [dbo].[User_Demographic_Data]
